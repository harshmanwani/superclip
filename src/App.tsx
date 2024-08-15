import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
// import { emit, listen } from '@tauri-apps/api/event'
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import { listen } from '@tauri-apps/api/event';

import "./App.css";

function App() {

  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    const initApp = async () => {
      await invoke("init");
      listen('panel-shown', (event) => {
        console.log(event);
        readClipboard();
      });
    };
    initApp();
  }, []);

  const readClipboard = async () => {
    try {
      const clipboardContent = await readText();
      setContent(clipboardContent);
      console.log(clipboardContent);
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      handleError(String(error));
    }
  };

  const clearClipboard = async () => {
    try {
      await writeText("");
    } catch (error) {
      console.error("Failed to clear clipboard:", error);
      handleError(String(error));
    }
  };

  const handleError = (error: string) => {
    setError(error);
  };

  const writeClipboard = async (content: string) => {
    try {
      await writeText(content);
    } catch (error) {
      console.error("Failed to write clipboard:", error);
      handleError(String(error));
    }
  };

  return (
    <div className="container">
      <h1>Menubar App</h1>
      <p>Your content goes here...</p>
      <p>Niceeee</p>
      <p>{error}</p>
      <div>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={() => writeClipboard(input)}>Write Clipboard</button>
      </div>
      <button onClick={clearClipboard}>Clear Clipboard</button>
      <button onClick={readClipboard}>Read Clipboard</button>
      <p>{content}</p>
    </div>
  );
}

export default App;