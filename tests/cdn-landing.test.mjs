import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const page = await fs.readFile(new URL('../vercel-proxy/index.html', import.meta.url), 'utf8');
const faviconUrl = 'https://cdn.naig.me/2065ed4e8bfbdf5cfbaebef422ef9cbd72f742d7a31f72e8236cc48b200406a1.png';

test('landing page is a standalone, accessible static document', () => {
  assert.match(page, /<html lang="en">/);
  assert.match(page, /<main>/);
  assert.match(page, /<h1 id="cdn-heading">CDN<\/h1>/);
  assert.match(page, /aria-label="CDN information"/);
  assert.doesNotMatch(page, /<script\b/i);
  assert.match(page, new RegExp(`<link rel="icon" type="image/png" href="${faviconUrl}"`));
});

test('landing page includes only approved public information', () => {
  for (const forbidden of ['tailscale', 'funnel', 'serve', 'docker', 'mongo', 'api/', '127.0.0.1', 'charles-thinkpad']) {
    assert.doesNotMatch(page.toLowerCase(), new RegExp(forbidden));
  }
  assert.match(page, /Public asset delivery for Naig projects\./);
  assert.match(page, /Direct asset URLs only/);
  assert.match(page, /© 2026 Naig/);
});
