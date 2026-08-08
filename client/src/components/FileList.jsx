// client/src/components/FileList.jsx
import React, { useState, useEffect } from 'react';
import { fetchFiles, deleteFile, getCdnUrl } from '../api';

function FileList({ apiKey, refresh }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadFiles();
  }, [page, refresh]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchFiles(page, 50);
      setFiles(data.files);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!apiKey) {
      alert('Please enter your API key to delete files');
      return;
    }

    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await deleteFile(id, apiKey);
      loadFiles();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const copyToClipboard = (text) => {
    // Get the full URL including the website domain
    const fullUrl = text.startsWith('http') ? text : `${window.location.origin}${text}`;
    
    navigator.clipboard.writeText(fullUrl).then(() => {
      // Show a temporary success message
      const button = event.target.closest('button');
      const originalHTML = button.innerHTML;
      button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M5 13L9 17L19 7" stroke="#70d070" stroke-width="3" stroke-linecap="square"/></svg>Copied!`;
      button.style.background = 'linear-gradient(180deg, #2a3a2a 0%, #1f2f1f 100%)';
      button.style.color = '#70d070';
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.background = '';
        button.style.color = '';
      }, 2000);
    }).catch(err => {
      alert('Failed to copy to clipboard');
    });
  };

  if (loading) return <div className="loading">Loading files...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="file-list">
      <h2>Uploaded Files ({files.length} files)</h2>

      {files.length === 0 ? (
        <p className="empty">No files uploaded yet.</p>
      ) : (
        <>
          <div className="files-grid">
            {files.map((file) => (
              <div key={file._id} className="file-card">
                {file.mime.startsWith('image/') && (
                  <img
                    src={getCdnUrl(file.url)}
                    alt={file.originalName}
                    className="file-preview"
                  />
                )}

                <div className="file-info">
                  <h3 className="file-name">{file.originalName}</h3>
                  <p className="file-meta">
                    {(file.size / 1024).toFixed(1)} KB | {file.mime}
                  </p>
                  <p className="file-date">
                    {new Date(file.createdAt).toLocaleString()}
                  </p>

                  <div className="file-actions">
                    <button
                      className="btn-copy"
                      onClick={() => copyToClipboard(getCdnUrl(file.url))}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}}>
                        <rect x="8" y="8" width="12" height="14" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M6 6L6 2L18 2L18 6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Copy URL
                    </button>
                    <a
                      href={getCdnUrl(file.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-view"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}}>
                        <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        <path d="M2 12C2 12 5 6 12 6C19 6 22 12 22 12C22 12 19 18 12 18C5 18 2 12 2 12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      View
                    </a>
                    {apiKey && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(file._id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}}>
                          <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                          <path d="M8 6V4H16V6" stroke="currentColor" strokeWidth="2"/>
                          <rect x="5" y="8" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}}>
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                </svg>
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px'}}>
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FileList;
