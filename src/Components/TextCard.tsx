import React from 'react';
import './TextCard.css';
import { ClipboardEntry } from '../types';

interface TextCardProps extends ClipboardEntry {
  onClick: () => void;
  isCurrent: boolean;
  isCopied: boolean;
}

const TextCard: React.FC<TextCardProps> = ({ content, timestamp, onClick, isCurrent, isCopied }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    let options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    if (!isToday) {
      options = {
        ...options,
        month: 'short',
        day: 'numeric',
      };
    }

    return date.toLocaleString('en-US', options);
  };

  return (
    <div
      className={`text-card ${isCurrent ? 'current' : ''} ${isCopied ? 'copied' : ''}`}
      onClick={onClick}
      title={content}
    >
      <p className="text-content">{content}</p>
      {
        isCurrent ? (
          <span className="text-timestamp current-indicator">Current</span>
        ) : (
          <span className="text-timestamp">{formatTimestamp(timestamp)}</span>
        )
      }
      {isCopied && <span className="copied-indicator">Copied!</span>}
    </div>
  );
};

export default TextCard;