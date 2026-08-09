import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPublicCdnUrl, getPublicAssetUrl, normalizePublicCdnBaseUrl, responseError } from '../src/api.js';

test('HTML gateway errors become a clean HTTP message', async () => {
  const response = new Response('<html><body>413 Request Entity Too Large</body></html>', { status: 413, headers: { 'content-type': 'text/html' } });
  assert.equal(await responseError(response, 'Upload failed'), 'Upload failed (HTTP 413)');
});

test('JSON errors preserve their server message', async () => {
  const response = new Response(JSON.stringify({ error: 'Storage quota exceeded' }), { status: 413, headers: { 'content-type': 'application/json' } });
  assert.equal(await responseError(response, 'Upload failed'), 'Storage quota exceeded');
});

test('normalizes a configured public CDN base URL and uses the stored object name', () => {
  const storedName = 'b73be66c205945d43eacbf1800287c738b51f1d6e84cd363f27111651edbe462.pdf';
  assert.equal(normalizePublicCdnBaseUrl(' https://cdn.naig.me/// '), 'https://cdn.naig.me');
  assert.equal(
    getPublicAssetUrl({ storedName, originalName: 'private-not-used.pdf', url: `/cdn/${storedName}` }, 'https://cdn.naig.me/'),
    `https://cdn.naig.me/${storedName}`,
  );
});

test('VIEW and COPY use the same public URL without a private CDN path', () => {
  const storedName = 'content-addressed name.png';
  const publicUrl = getPublicAssetUrl({ storedName }, 'https://cdn.naig.me');

  assert.equal(publicUrl, 'https://cdn.naig.me/content-addressed%20name.png');
  assert.equal(buildPublicCdnUrl(storedName, 'https://cdn.naig.me/'), publicUrl);
  assert.equal(publicUrl.includes('/cdn/'), false);
  assert.equal(publicUrl.includes(':8443'), false);
  assert.equal(/^https:\/\/cdn\.naig\.me\//.test(publicUrl), true);
});

test('uses the private same-origin CDN route only as a development fallback', () => {
  assert.equal(buildPublicCdnUrl('example.png', ''), '/cdn/example.png');
  assert.equal(getPublicAssetUrl({ originalName: 'not-an-identifier.png' }, 'https://cdn.naig.me'), null);
});
