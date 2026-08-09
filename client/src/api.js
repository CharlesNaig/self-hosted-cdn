const publicCdnBaseUrl = (import.meta.env?.VITE_PUBLIC_CDN_BASE_URL || '').replace(/\/+$/, '');

export async function responseError(response, fallback) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const body = await response.json();
      if (body?.error || body?.message) return body.error || body.message;
    } catch { /* Fall back to an HTTP-safe message. */ }
  } else {
    const text = (await response.text().catch(() => '')).trim();
    if (text && !/^<!doctype|^<html/i.test(text)) return `HTTP ${response.status}: ${text.slice(0, 240)}`;
  }
  return `${fallback} (HTTP ${response.status})`;
}

async function requireJson(response, fallback) {
  if (!response.ok) throw new Error(await responseError(response, fallback));
  try { return await response.json(); } catch { throw new Error(`${fallback}: server returned an invalid response`); }
}

export async function uploadFile(file, apiKey) {
  const formData = new FormData();
  formData.append('file', file);
  return requireJson(await fetch('/api/upload', { method: 'POST', headers: apiKey ? { 'x-api-key': apiKey } : {}, body: formData }), 'Upload failed');
}

export async function fetchFiles(page = 1, limit = 50, apiKey = '') {
  return requireJson(await fetch(`/api/files?page=${page}&limit=${limit}`, { headers: apiKey ? { 'x-api-key': apiKey } : {} }), 'Failed to fetch files');
}

export async function deleteFile(id, apiKey) {
  return requireJson(await fetch(`/api/files/${id}`, { method: 'DELETE', headers: apiKey ? { 'x-api-key': apiKey } : {} }), 'Delete failed');
}

export function getCdnUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;
  return publicCdnBaseUrl ? `${publicCdnBaseUrl}${url}` : url;
}
