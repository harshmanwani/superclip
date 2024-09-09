import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import './ClipboardViewer.css';
import TextItem from './Components/TextCard';
import { ClipboardEntry } from './types';

function ClipboardViewer() {
  const [history, setHistory] = useState<ClipboardEntry[]>([]);

  useEffect(() => {
    // Function to fetch clipboard history
    async function fetchHistory() {
      try {
        const clipboardHistory = await invoke('fetch_clipboard_history');
        setHistory(clipboardHistory as ClipboardEntry[]);
      } catch (error) {
        console.error('Failed to fetch clipboard history:', error);
      }
    }

    // Fetch history immediately on component mount
    fetchHistory();

    // Listen for clipboard update events
    const unlisten = listen('clipboard-updated', () => {
      fetchHistory();
    });

    // Cleanup function
    return () => {
      unlisten.then(f => f());
    };
  }, []);

  const clearClipboardHistory = async () => {
    try {
      await invoke('clear_clipboard_history');
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear clipboard history:', error);
    }
  };

  return (
    <div className="clipboard-viewer">
      <div className="header">
        <h2>Clipboard History</h2>
        <button onClick={clearClipboardHistory} className="clear-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
          </svg>
        </button>
      </div>
      <div className="clipboard-list">
        {history.map((item, index) => (
          <TextItem key={index} content={item.content} timestamp={item.timestamp} />
        ))}
      </div>
    </div>
  );
}

export default ClipboardViewer;