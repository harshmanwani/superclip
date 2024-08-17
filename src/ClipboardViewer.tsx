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

  return (
    <div className="clipboard-viewer">
      <h2>Clipboard History</h2>
      <div className="clipboard-list">
        {/* <p>{JSON.stringify(history)}</p> */}
        {history.map((item, index) => (
          <TextItem key={index} content={item.content} timestamp={item.timestamp} />
        ))}
      </div>
    </div>
  );
}

export default ClipboardViewer;