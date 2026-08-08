// client/src/components/Uploader.jsx
import React, { useState, useRef } from 'react';
import { uploadFile } from '../api';

function Uploader({ apiKey, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const result = await uploadFile(file, apiKey);
      setMessage({
        type: 'success',
        text: result.duplicate
          ? `File already exists! Using existing: ${result.storedName}`
          : `Uploaded successfully: ${result.storedName}`,
      });
      onUploadSuccess();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="uploader">
      <h2>Upload File</h2>

      <div
        className={`drop-zone ${dragActive ? 'active' : ''} ${
          uploading ? 'uploading' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '8px'}}>
              <circle cx="12" cy="12" r="10" stroke="#909090" strokeWidth="2" strokeDasharray="4 4">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
              </circle>
            </svg>
            Uploading...
          </p>
        ) : (
          <>
            <p>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '8px'}}>
                <path d="M12 4L12 16M12 4L8 8M12 4L16 8" stroke="#909090" strokeWidth="2" strokeLinecap="square"/>
                <rect x="4" y="18" width="16" height="2" fill="#909090"/>
              </svg>
              Drag & drop a file here, or click to select
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}
    </div>
  );
}

export default Uploader;
