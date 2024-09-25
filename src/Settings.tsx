import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';
import "./settings.css"

function Settings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated on component mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await invoke('check_auth_status');
      setUser(userData);
    } catch (error) {
      console.error('Failed to check auth status:', error);
    }
  };

  const handleLogin = async () => {
    try {
      // Open the Auth0 login page in the default browser
      await open('https://dev-vd0xcbf5cr3qnwhb.us.auth0.com/authorize?client_id=zmJ0KKnHViwP59YqevliutRyjYKFA6MH&response_type=code&redirect_uri=http://localhost:1420/callback&scope=openid%20profile%20email');
    } catch (error) {
      console.error('Failed to open login page:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await invoke('logout');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const closeSettings = async () => {
    await invoke('close_settings');
  };

  return (
    <div className="settings-panel">
      <h2>Settings</h2>
      <div className="auth-section">
        {user ? (
          <div>
            <p>Welcome, {user.name}!</p>
            <button onClick={handleLogout} className="auth-button">
              Log Out
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="auth-button">
            Sign In
          </button>
        )}
      </div>
      <button onClick={closeSettings} className="close-button">
        Close
      </button>
    </div>
  );
}

export default Settings;