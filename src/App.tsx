import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import ClipboardViewer from './ClipboardViewer';

import "./App.css";

function App() {

  useEffect(() => {
    const initApp = async () => {
      await invoke("init");
    };
    initApp();
  }, []);

  return (
    <div className="container">
      <ClipboardViewer />
    </div>
  );
}

export default App;