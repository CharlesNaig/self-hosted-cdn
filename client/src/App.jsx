// client/src/App.jsx
import React, { useState } from 'react';
import Uploader from './components/Uploader';
import FileList from './components/FileList';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [refresh, setRefresh] = useState(0);

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const triggerRefresh = () => setRefresh((prev) => prev + 1);

  return (
    <div className="app">
      <header className="header">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="3" fill="#606060" opacity="0.8"/>
            <rect x="2" y="7" width="20" height="3" fill="#707070" opacity="0.7"/>
            <rect x="2" y="12" width="20" height="3" fill="#808080" opacity="0.6"/>
            <rect x="2" y="17" width="20" height="3" fill="#606060" opacity="0.5"/>
            <rect x="0" y="0" width="2" height="24" fill="#505050"/>
            <circle cx="4" cy="3.5" r="0.8" fill="#a0a0a0"/>
            <circle cx="4" cy="8.5" r="0.8" fill="#a0a0a0"/>
            <circle cx="4" cy="13.5" r="0.8" fill="#a0a0a0"/>
            <circle cx="4" cy="18.5" r="0.8" fill="#a0a0a0"/>
          </svg>
          CDN Database
        </h1>
        <div className="api-key-input">
          <label htmlFor="api-key">API Key</label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter admin key"
          />
        </div>
      </header>

      <main className="main">
        <Uploader apiKey={apiKey} onUploadSuccess={triggerRefresh} />
        <FileList apiKey={apiKey} refresh={refresh} />
      </main>

      <footer className="footer">
        <p>
          System Status: <strong>Online</strong> // Database: <strong>Active</strong> // Secure Storage
        </p>
      </footer>
    </div>
  );
}

export default App;
