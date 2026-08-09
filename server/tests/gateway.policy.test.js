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

test('private admin gateway serves the SPA and proxies private application paths', async () => {
  const config = await fs.readFile(new URL('../../private-admin-gateway/nginx.conf', import.meta.url), 'utf8');
  assert.match(config, /try_files \$uri \$uri\/ \/index\.html/);
  for (const location of ['/api/', '/health/', '/cdn/']) {
    assert.match(config, new RegExp(`location ${location.replace('/', '\\/')}`));
  }
  assert.match(config, /proxy_pass http:\/\/app:3000/);
  assert.match(config, /proxy_set_header X-API-Key \$http_x_api_key/);
  assert.match(config, /client_max_body_size \$\{NGINX_CLIENT_MAX_BODY_SIZE\}/);
  assert.match(config, /return 413 '\{"error":"Upload exceeds the configured size limit"\}'/);
});

test('Compose limits nginx template substitution to the body-size setting', async () => {
  const compose = await fs.readFile(new URL('../../docker-compose.yml', import.meta.url), 'utf8');
  assert.match(compose, /NGINX_ENVSUBST_FILTER: NGINX_CLIENT_MAX_BODY_SIZE/);
});
