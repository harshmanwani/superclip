import React, { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import './ClipboardViewer.css';
import TextCard from './Components/TextCard';
import { ClipboardEntry } from './types';
import { FaTrash } from 'react-icons/fa';

function ClipboardViewer() {
  const [currentClipboard, setCurrentClipboard] = useState<string>('');
  const [history, setHistory] = useState<ClipboardEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchCurrentClipboard() {
      const content = await readText();
      setCurrentClipboard(content || '');
    }
    async function fetchHistory() {
      try {
        const clipboardHistory = await invoke('fetch_clipboard_history');
        setHistory((clipboardHistory as ClipboardEntry[]).filter(item => item.content !== currentClipboard));
      } catch (error) {
        console.error('Failed to fetch clipboard history:', error);
      }
    }

    fetchCurrentClipboard();
    fetchHistory();

    const unlisten = listen('clipboard-updated', () => {
      fetchCurrentClipboard();
      fetchHistory();
    });

    return () => {
      unlisten.then(f => f());
    };
  }, [currentClipboard]);

  const clearClipboardHistory = async () => {
    try {
      await invoke('clear_clipboard_history');
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear clipboard history:', error);
    }
  };

  const handleItemClick = async (content: string) => {
    if (isWriting) return;
    setIsWriting(true);
    try {
      await invoke('mark_user_copy');
      await writeText(content);
      console.log('Content copied to clipboard');
    } catch (error) {
      console.error('Failed to write to clipboard:', error);
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="clipboard-viewer" ref={containerRef}>
      <div className="header">
        <h2>Clipboard</h2>
      </div>
      <div className="clipboard-content">
        <div className="current-clipboard">
          <TextCard
            content={currentClipboard}
            timestamp={new Date().toISOString()}
            onClick={() => handleItemClick(currentClipboard)}
            isCurrent={true}
          />
        </div>
        <div className="divider">
          <span>History ({history.length})</span>
        </div>
        <div className="clipboard-list">
          {history.map((item, index) => (
            <TextCard
              key={index}
              content={item.content}
              timestamp={item.timestamp}
              onClick={() => handleItemClick(item.content)}
              isCurrent={false}
            />
          ))}
        </div>
        <button onClick={clearClipboardHistory} className="clear-button">
          <FaTrash /> Clear History
        </button>
      </div>
    </div>
  );
}

export default ClipboardViewer;