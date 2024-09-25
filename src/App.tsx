import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import ClipboardViewer from './Components/ClipboardViewer';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Auth0Provider } from '@auth0/auth0-react';
import Settings from "./Settings";

const appWindow = getCurrentWindow();

function AppContent() {
  const [isSettingsWindow, setIsSettingsWindow] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      await invoke("init");
    };
    initApp();
    const checkIfSettingsWindow = async () => {
      const title = await appWindow.title();
      if (title === 'Settings') {
        setIsSettingsWindow(true);
      }
    };

    checkIfSettingsWindow();
  }, []);

  return (
    <div className="container">
      {isSettingsWindow ? <Settings /> : <ClipboardViewer />}
    </div>
  );
}

function App() {
  return (
    <Auth0Provider
      domain="dev-vd0xcbf5cr3qnwhb.us.auth0.com"
      clientId="zmJ0KKnHViwP59YqevliutRyjYKFA6MH"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      cacheLocation="localstorage"
    >
      <AppContent />
    </Auth0Provider>
  );
}

export default App;