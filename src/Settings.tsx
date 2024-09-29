import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuth0 } from '@auth0/auth0-react';
import AuthComponent from './Components/AuthComponent';
import { listen } from '@tauri-apps/api/event';
import "./settings.css"

function Settings() {
  const { user, isAuthenticated, logout, getAccessTokenSilently } = useAuth0();
  const [error, setError] = useState('');
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      storeUserData();
      fetchUserData();
    }
  }, [isAuthenticated, user]);
  
  useEffect(() => {
    const unlistenPanelOpen = listen('settings-window-shown', () => {
      fetchUserData();
      // scrollTop();
    });

    return () => {
      unlistenPanelOpen.then(f => f());
    };
  }, []);

  const storeUserData = async () => {
    if (!user) return;
    try {
      await invoke('store_auth0_user_data', { 
        userId: user.sub,
        auth0Id: user.sub,
        subscriptionStatus: isPro ? 'pro' : 'trial',
        trialStart: isPro ? null : new Date().toISOString(),
        extraData: JSON.stringify({
          email: user.email,
          name: user.name,
          picture: user.picture,
        })
      });
    } catch (error) {
      console.error('Failed to store user data:', error);
      setError('Failed to store user data');
    }
  };

  const fetchUserData = async () => {
    if (!user) return;
    try {
      console.log("Fetching user data");
      console.log(user);
      const userData = await invoke('get_auth0_user_data', { auth0Id: user.sub });
      if (userData) {
        setIsPro(userData.subscription_status === 'pro');
        if (userData.trial_start) {
          const trialStart = new Date(userData.trial_start);
          const trialEnd = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days trial
          const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          setTrialDaysLeft(daysLeft);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError('Failed to fetch user data');
    }
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const closeSettings = async () => {
    await invoke('close_settings');
  };

  const handleUpgradeToPro = async () => {
    try {
      // Implement your upgrade to Pro logic here
      setIsPro(true);
      await storeUserData(); // Update user data after upgrading to Pro
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
                  Sign Out
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