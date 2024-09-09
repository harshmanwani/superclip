import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import './ClipboardViewer.css';
import TextItem from './Components/TextCard';
import { ClipboardEntry } from './types';
import { FaTrash } from 'react-icons/fa';


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
          <FaTrash />
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