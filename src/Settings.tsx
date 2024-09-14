import { invoke } from '@tauri-apps/api/core';
import "./settings.css"
// import { getCurrentWindow } from '@tauri-apps/api/window';
// const appWindow = getCurrentWindow();

function Settings() {
  const closeSettings = async () => {
    // await appWindow.hide();
    await invoke('close_settings'); // Call the command to close the settings window
  };

  return (
    <div className="settings-panel">
      <h2>Settings</h2>
      <div>lol</div>
      {/* Add your settings options here */}
      <button onClick={closeSettings} className="close-button">
        Close
      </button>
    </div>
  );
}

export default Settings;