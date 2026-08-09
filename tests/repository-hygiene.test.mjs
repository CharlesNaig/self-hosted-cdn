import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'build']);
const backupExtensions = /\.(?:rar|7z|bak|backup)$/i;
const privateEndpointPatterns = [
  { label: 'Tailscale DNS hostname', pattern: /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.ts\.net\b/i },
  { label: 'private IPv4 address', pattern: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/ },
];

async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolutePath));
    else files.push(absolutePath);
  }
  return files;
}

test('public repository excludes backup archives and private infrastructure endpoints', async () => {
  const violations = [];
  for (const absolutePath of await walk(root)) {
    const relativePath = path.relative(root, absolutePath).replaceAll('\\', '/');
    if (backupExtensions.test(relativePath)) {
      violations.push(`${relativePath}: backup archive`);
      continue;
    }
    if (relativePath === '.env.example' || /(?:package-lock\.json|\.png|\.ico|\.woff2?)$/i.test(relativePath)) continue;
    const content = await fs.readFile(absolutePath, 'utf8').catch(() => '');
    for (const { label, pattern } of privateEndpointPatterns) {
      if (pattern.test(content)) violations.push(`${relativePath}: ${label}`);
    }
  }
  assert.deepEqual(violations, []);
});
