import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuth0 } from '@auth0/auth0-react';
import "./settings.css"
import AuthComponent from './Components/AuthComponent';

function Settings() {
  const { user, isAuthenticated, logout } = useAuth0();
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const closeSettings = async () => {
    await invoke('close_settings');
  };

  return (
    <div className="settings-panel">
      <h2>Settings</h2>
      <div className="settings-grid">
        <div className="settings-item">
          <span className="settings-label">User Account</span>
          <div className="settings-value">
            {isAuthenticated ? (
              <div className="user-info">
                <img src={user?.picture} alt={user?.name} className="user-avatar" />
                <span>{user?.name}</span>
                <button onClick={handleLogout} className="auth-button">
                  Log Out
                </button>
              </div>
            ) : (
              <AuthComponent setError={setError} />
            )}
          </div>
        </div>
        {/* Add more settings items here */}
      </div>
      {error && <p className="error-message">{error}</p>}
      <button onClick={closeSettings} className="close-button">
        Close
      </button>
    </div>
  );
}

export default Settings;