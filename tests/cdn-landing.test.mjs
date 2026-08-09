import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const page = await fs.readFile(new URL('../vercel-proxy/index.html', import.meta.url), 'utf8');
const faviconUrl = '/cdn-logo.png';

test('landing page is a standalone, accessible static document', () => {
  assert.match(page, /<html lang="en">/);
  assert.match(page, /<main>/);
  assert.match(page, /<h1 id="cdn-heading">CDN<\/h1>/);
  assert.match(page, /aria-label="CDN information"/);
  assert.match(page, /<img class="logo" src="\/cdn-logo\.png"/);
  assert.doesNotMatch(page, /<script\b/i);
  assert.match(page, new RegExp(`<link rel="icon" type="image/png" href="${faviconUrl}"`));
});

test('landing page includes only approved public information', () => {
  for (const forbidden of ['tailscale', 'funnel', 'serve', 'docker', 'mongo', 'api/', '127.0.0.1', 'charles-thinkpad']) {
    assert.doesNotMatch(page.toLowerCase(), new RegExp(forbidden));
  }
  assert.match(page, /content-addressed delivery layer for Naig projects/);
  assert.match(page, /Direct asset URLs only/);
  assert.match(page, /© 2026 Naig/);
});

test('public proxy examples contain no private infrastructure identifiers', async () => {
  const directory = new URL('../vercel-proxy/', import.meta.url);
  const files = await fs.readdir(directory);
  const text = (await Promise.all(files
    .filter((file) => ['.html', '.json', '.md'].includes(path.extname(file)))
    .map((file) => fs.readFile(new URL(file, directory), 'utf8')))).join('\n').toLowerCase();
  for (const forbidden of ['.ts.net', '127.0.0.1', '192.168.', 'mongodb://', 'mongodb+srv://']) {
    assert.equal(text.includes(forbidden), false);
  }
});
