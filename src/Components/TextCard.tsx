import React, { useState } from 'react';
import './TextCard.css';
import { ClipboardEntry } from '../types';

interface TextCardProps extends ClipboardEntry {
  onClick: () => void;
  isCurrent: boolean;
}

const TextCard: React.FC<TextCardProps> = ({ content, timestamp, onClick, isCurrent }) => {
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
      className={`text-card ${isCurrent ? 'current' : ''}`} 
      onClick={onClick}
      title={content}
    >
      <p className="text-content">{content}</p>
      <span className="text-timestamp">{formatTimestamp(timestamp)}</span>
      {isCurrent && <span className="current-indicator">Current</span>}
    </div>
  );
};

export default TextCard;