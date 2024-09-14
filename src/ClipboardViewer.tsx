import { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';
import './ClipboardViewer.css';
import TextCard from './Components/TextCard';
import { ClipboardEntry } from './types';
import { FaTrash, FaCog } from 'react-icons/fa';
// import { appWindow } from '@tauri-apps/api/window';

function ClipboardViewer() {
  const [currentClipboard, setCurrentClipboard] = useState<string>('');
  const [history, setHistory] = useState<ClipboardEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchCurrentClipboard = async () => {
    const content = await readText();
    setCurrentClipboard(content || '');
  }

  const fetchHistory = async () => {
    try {
      const clipboardHistory = await invoke('fetch_clipboard_history');
      setHistory((clipboardHistory as ClipboardEntry[]).filter((item, index) => 
        index === 0 ? item.content !== currentClipboard : true
      ));
    } catch (error) {
      console.error('Failed to fetch clipboard history:', error);
    }
  }

  const scrollTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }

  useEffect(() => {
    scrollTop();
    fetchCurrentClipboard();
    fetchHistory();

    const unlisten = listen('clipboard-updated', () => {
      fetchCurrentClipboard();
      fetchHistory();
    });

    return () => {
      unlisten.then(f => f());
    };
  }, []);

  useEffect(() => {
    const unlistenPanelOpen = listen('panel-shown', () => {
      scrollTop();
    });

    return () => {
      unlistenPanelOpen.then(f => f());
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

  const handleItemClick = async (content: string, index: number) => {
    if (isWriting) return;
    setIsWriting(true);
    try {
      await invoke('mark_user_copy');
      await writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1000);
      console.log('Content copied to clipboard');
    } catch (error) {
      console.error('Failed to write to clipboard:', error);
    } finally {
      setIsWriting(false);
      fetchCurrentClipboard();
    }
  };

  const confirmClearHistory = () => {
    setShowConfirmation(true);
  };

  const handleClearHistory = async () => {
    await clearClipboardHistory();
    setShowConfirmation(false);
  };

  // const handleQuitApp = async () => {
  //   await appWindow.close();
  // };

  return (
    <div className="clipboard-viewer">
      <div className="header">
        <h2>Clipboard</h2>
      </div>
      <div className="clipboard-content" ref={containerRef}>
        <div className="current-clipboard">
          <TextCard
            content={currentClipboard}
            timestamp={new Date().toISOString()}
            onClick={() => handleItemClick(currentClipboard, -1)}
            isCurrent={true}
            isCopied={copiedIndex === -1}
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
              onClick={() => handleItemClick(item.content, index)}
              isCurrent={false}
              isCopied={copiedIndex === index}
            />
          ))}
        </div>
        <div className="button-container">
          {showConfirmation ? (
            <div className="confirmation">
              <p>Are you sure?</p>
              <button onClick={handleClearHistory} className="confirm-button">Yes</button>
              <button onClick={() => setShowConfirmation(false)} className="cancel-button">No</button>
            </div>
          ) : history.length && (
            <button onClick={confirmClearHistory} className="clear-button">
              <FaTrash />&nbsp;Clear History
            </button>
          ) || ""}
          {/* <button onClick={handleQuitApp} className="quit-button">
            <FaTimes /> Quit App
          </button> */}
        </div>
      </div>
      <footer className="footer">
        <button onClick={() => invoke('open_settings')} className="settings-button">
          <FaCog />&nbsp;Settings
        </button>
      </footer>
    </div>
  );
}

export default ClipboardViewer;