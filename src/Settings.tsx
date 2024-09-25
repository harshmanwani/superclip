import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuth0 } from '@auth0/auth0-react';
import "./settings.css"
import AuthComponent from './Components/AuthComponent';

function Settings() {
  const { user, isAuthenticated, logout, getAccessTokenSilently } = useAuth0();
  const [error, setError] = useState('');
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isPro, setIsPro] = useState(false);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const closeSettings = async () => {
    await invoke('close_settings');
  };

  const handleUpgradeToPro = async () => {
    try {
      await invoke('upgrade_to_pro');
      setIsPro(true);
    } catch (error) {
      console.error('Failed to upgrade to Pro:', error);
      setError('Failed to upgrade to Pro');
    }
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
                {isPro ? (
                  <p className="pro-info">Pro User</p>
                ) : trialDaysLeft > 0 ? (
                  <p className="trial-info">Trial: {trialDaysLeft} days left</p>
                ) : (
                  <p className="trial-info">Trial expired</p>
                )}
                <button onClick={handleLogout} className="auth-button">
                  Log Out
                </button>
              </div>
            ) : (
              <AuthComponent setError={setError} />
            )}
          </div>
        </div>
        {isAuthenticated && (
          <div className="settings-item">
            <span className="settings-label">Cloud Sync</span>
            <div className="settings-value">
              <p>Your clipboard is syncing to the cloud.</p>
              {!isPro && trialDaysLeft <= 0 && (
                <button onClick={handleUpgradeToPro} className="auth-button">
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
      <button onClick={closeSettings} className="close-button">
        Close
      </button>
    </div>
  );
}

export default Settings;