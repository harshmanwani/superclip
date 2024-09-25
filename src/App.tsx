import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import ClipboardViewer from './ClipboardViewer';
import { getCurrentWindow } from '@tauri-apps/api/window';
const appWindow = getCurrentWindow();

import Settings from "./Settings";
import { Auth0Provider } from '@auth0/auth0-react';

function App() {

  const [isSettingsWindow, setIsSettingsWindow] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      await invoke("init");
    };
    initApp();
    const checkIfSettingsWindow = async () => {
      const title = await appWindow.title();
      console.log(title, "window title")
      // Assuming the settings window has a specific title
      if (title === 'Settings') {
        setIsSettingsWindow(true);
      }
    };

    checkIfSettingsWindow();
  }, []);

  return (
    <Auth0Provider
      domain="dev-vd0xcbf5cr3qnwhb.us.auth0.com"
      clientId="zmJ0KKnHViwP59YqevliutRyjYKFA6MH"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <div className="container">
        {
          isSettingsWindow ? <Settings /> : <ClipboardViewer />
        }
      </div>
    </Auth0Provider>
  );
}

export default App;