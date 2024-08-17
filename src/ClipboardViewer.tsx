import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

function ClipboardViewer() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    // Function to fetch clipboard history
    async function fetchHistory() {
      try {
        const clipboardHistory = await invoke('fetch_clipboard_history');
        setHistory(clipboardHistory as string[]);
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
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Clipboard History</h2>
      <div className="overflow-auto flex-grow w-full">
        <ul className="list-disc px-8">
          {history.map((item, index) => (
            <li key={index} className="text-lg mb-2 break-all">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ClipboardViewer;