import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import ClipboardViewer from './ClipboardViewer';
import { getCurrentWindow } from '@tauri-apps/api/window';
const appWindow = getCurrentWindow();

import Settings from "./Settings";

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
    <div className="container">
      {
        isSettingsWindow ? <Settings /> : <ClipboardViewer />
      }
    </div>
  );
}

export default App;