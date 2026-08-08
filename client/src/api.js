// client/src/api.js

/**
 * Upload a file to the CDN
 */
export async function uploadFile(file, apiKey) {
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

/**
 * Fetch list of files
 */
export async function fetchFiles(page = 1, limit = 50) {
  const response = await fetch(`/api/files?page=${page}&limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to fetch files');
  }

  return response.json();
}

/**
 * Delete a file by ID
 */
export async function deleteFile(id, apiKey) {
  const response = await fetch(`/api/files/${id}`, {
    method: 'DELETE',
    headers: {
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Delete failed');
  }

  return response.json();
}

/**
 * Get full CDN URL for a file
 */
export function getCdnUrl(url) {
  if (url.startsWith('http')) return url;
  return url;
}
