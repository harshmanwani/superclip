import React from 'react';
import './TextCard.css';
import { ClipboardEntry } from '../types';

interface TextCardProps extends ClipboardEntry {
  onClick: () => void;
}

const TextCard: React.FC<TextCardProps> = ({ content, timestamp, onClick }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isThisYear = date.getFullYear() === now.getFullYear();
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
        year: isThisYear ? undefined : 'numeric',
      };
    }

    return date.toLocaleString('en-US', options);
  };

  return (
    <div className="text-card" onClick={onClick}>
      <p className="text-content">{content}</p>
      <span className="text-timestamp">{formatTimestamp(timestamp)}</span>
    </div>
  );
};

export default TextCard;