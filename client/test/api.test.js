import test from 'node:test';
import assert from 'node:assert/strict';
import { getCdnUrl, responseError } from '../src/api.js';

test('HTML gateway errors become a clean HTTP message', async () => {
  const response = new Response('<html><body>413 Request Entity Too Large</body></html>', { status: 413, headers: { 'content-type': 'text/html' } });
  assert.equal(await responseError(response, 'Upload failed'), 'Upload failed (HTTP 413)');
});

test('JSON errors preserve their server message', async () => {
  const response = new Response(JSON.stringify({ error: 'Storage quota exceeded' }), { status: 413, headers: { 'content-type': 'application/json' } });
  assert.equal(await responseError(response, 'Upload failed'), 'Storage quota exceeded');
});

test('relative CDN paths stay same-origin without a configured public base URL', () => {
  assert.equal(getCdnUrl('/cdn/example.png'), '/cdn/example.png');
});
