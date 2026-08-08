import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('nginx public gateway policy permits only CDN GET/HEAD proxying', async () => {
  const config = await fs.readFile(new URL('../../gateway/nginx.conf', import.meta.url), 'utf8');
  assert.match(config, /location \/cdn\//);
  assert.match(config, /limit_except GET HEAD \{ deny all; \}/);
  assert.match(config, /proxy_pass http:\/\/app:3000/);
  assert.match(config, /location \/ \{\s*return 404;/);
});
