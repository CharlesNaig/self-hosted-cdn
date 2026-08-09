import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../app.js';
import { ensureStorage } from '../utils/storage.js';

class MemoryFiles {
  constructor() { this.files = []; }
  async findOne(query) { return this.files.find((file) => Object.entries(query).every(([key, value]) => file[key] === value)) || null; }
  async create(document) {
    if (this.files.some((file) => file.sha256 === document.sha256 || file.storedName === document.storedName)) { const error = new Error('duplicate'); error.code = 11000; throw error; }
    const file = { ...document, _id: crypto.randomUUID(), createdAt: new Date(), toObject() { return { ...this }; } };
    this.files.push(file); return file;
  }
  aggregate() { return Promise.resolve([{ total: this.files.reduce((total, file) => total + file.size, 0) }]); }
  find() { const records = [...this.files]; return { sort: () => ({ skip: (count) => ({ limit: (limit) => ({ select: () => records.slice(count, count + limit) }) }) }) }; }
  async countDocuments() { return this.files.length; }
  async findById(id) { return this.files.find((file) => file._id === id) || null; }
  async findByIdAndDelete(id) { this.files = this.files.filter((file) => file._id !== id); }
}

let root; let config; let database; let app;
const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'cdn-test-'));
  config = { nodeEnv: 'test', port: 0, mongoUri: 'mongodb://test', adminApiKey: 'test-admin-key', storagePath: path.join(root, 'files'), tempStoragePath: path.join(root, 'tmp'), maxUploadSize: 256, storageQuotaBytes: 4096, minFreeDiskBytes: 1, allowedMimeTypes: new Set(['image/png', 'application/pdf', 'video/mp4', 'application/zip', 'audio/mpeg', 'image/svg+xml', 'application/json']), allowedExtensions: new Set(['png', 'pdf', 'mp4', 'zip', 'mp3', 'svg', 'json']), corsOrigin: 'http://localhost:5173', logLevel: 'error', trustProxy: false };
  await ensureStorage(config); database = new MemoryFiles();
  app = createApp({ config, mongoose: { connection: { readyState: 1 } }, fileModel: database, logger: { info() {}, error() {} } });
});
afterEach(async () => fs.rm(root, { recursive: true, force: true }));

async function upload() { return request(app).post('/api/upload').set('x-api-key', config.adminApiKey).attach('file', png, { filename: 'image.png', contentType: 'image/png' }); }
async function uploadFormat(buffer, filename, contentType) { return request(app).post('/api/upload').set('x-api-key', config.adminApiKey).attach('file', buffer, { filename, contentType }); }

test('liveness and readiness use the real application stack', async () => {
  await request(app).get('/health/live').expect(200, { status: 'ok' });
  await request(app).get('/health/ready').expect(200, { status: 'ready' });
});
test('readiness fails when MongoDB is unavailable', async () => {
  const unavailable = createApp({ config, mongoose: { connection: { readyState: 0 } }, fileModel: database, logger: { info() {}, error() {} } });
  await request(unavailable).get('/health/ready').expect(503, { status: 'not_ready' });
});
test('admin routes reject absent and incorrect keys', async () => {
  await request(app).get('/api/files').expect(401);
  await request(app).get('/api/files').set('x-api-key', 'wrong').expect(403);
  await request(app).post('/api/upload').attach('file', png, { filename: 'image.png', contentType: 'image/png' }).expect(401);
});
test('uploads are content addressed, deduplicated, and delivered through /cdn', async () => {
  const first = await upload(); assert.equal(first.status, 201); assert.equal(first.body.storedName, `${first.body.sha256}.png`);
  const second = await upload(); assert.equal(second.status, 200); assert.equal(second.body.duplicate, true); assert.equal(database.files.length, 1);
  const objectPath = path.join(config.storagePath, first.body.storedName); await fs.access(objectPath);
  const get = await request(app).get(first.body.url).expect(200); assert.equal(get.headers['cache-control'], 'public, max-age=31536000, immutable'); assert.equal(get.headers['x-content-type-options'], 'nosniff'); assert.equal(get.headers.etag, `"${first.body.sha256}"`); assert.deepEqual(get.body, png);
  const head = await request(app).head(first.body.url).expect(200); assert.equal(head.headers['content-length'], String(png.length));
  await request(app).get(first.body.url).set('if-none-match', get.headers.etag).expect(304);
  await request(app).get(`/api/cdn/${first.body.storedName}`).expect(404);
});
test('accepts configured document, archive, media, and SVG formats with safe delivery headers', async () => {
  const samples = [
    [png, 'image.png', 'image/png'], [Buffer.from('%PDF-1.7\n'), 'manual.pdf', 'application/pdf'],
    [Buffer.from([0, 0, 0, 16, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]), 'clip.mp4', 'video/mp4'],
    [Buffer.from([0x50, 0x4b, 0x03, 0x04]), 'bundle.zip', 'application/zip'], [Buffer.from('ID3test'), 'track.mp3', 'audio/mpeg'],
    [Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'logo.svg', 'image/svg+xml'],
  ];
  for (const [buffer, filename, mime] of samples) {
    const uploaded = await uploadFormat(buffer, filename, mime); assert.equal(uploaded.status, 201, filename);
    const served = await request(app).get(uploaded.body.url).expect(200);
    assert.equal(served.headers['content-type'], mime);
    if (['application/zip', 'image/svg+xml'].includes(mime)) assert.match(served.headers['content-disposition'], /^attachment;/);
    else assert.equal(served.headers['content-disposition'], undefined);
  }
});
test('rejects mismatched type, traversal, and oversized files without retaining temp files', async () => {
  await request(app).post('/api/upload').set('x-api-key', config.adminApiKey).attach('file', png, { filename: 'image.png', contentType: 'image/jpeg' }).expect(415);
  await request(app).post('/api/upload').set('x-api-key', config.adminApiKey).attach('file', Buffer.alloc(512), { filename: 'image.png', contentType: 'image/png' }).expect(413);
  await request(app).post('/api/upload').set('x-api-key', config.adminApiKey).attach('file', Buffer.from('unsupported'), { filename: 'program.exe', contentType: 'application/octet-stream' }).expect(415);
  for (const candidate of ['../x.png', '..%2Fx.png', '%2e%2e%2fx.png', 'C:%5Cx.png', 'a.png%00']) await request(app).get(`/cdn/${candidate}`).expect(404);
  assert.deepEqual(await fs.readdir(config.tempStoragePath), []);
});
test('only authorized deletion removes the physical content', async () => {
  const uploaded = await upload(); const objectPath = path.join(config.storagePath, uploaded.body.storedName);
  await request(app).delete(`/api/files/${database.files[0]._id}`).expect(401);
  await request(app).delete(`/api/files/${database.files[0]._id}`).set('x-api-key', config.adminApiKey).expect(200);
  await assert.rejects(fs.access(objectPath));
});
