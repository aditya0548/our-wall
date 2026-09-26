import React from 'react';
import { MoreVertical } from 'lucide-react';

export default function NoteCard({ note, isMine, authorName, authorAvatar, onMenuOpen }) {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className={`note-card ${isMine ? 'mine' : 'partner'}`}>
      <div className="note-avatar-container">
        {authorAvatar ? (
          <img src={authorAvatar} alt={authorName} className="note-avatar" />
        ) : (
          <div className="note-avatar fallback">
            {authorName ? authorName.substring(0, 1).toUpperCase() : '?'}
          </div>
        )}
      </div>

      <div className="note-content">
        <div className="note-bubble">
          {note.body}
          <button 
            className="note-menu-trigger" 
            onClick={(e) => onMenuOpen(note.id, e)}
            aria-label="Message options"
          >
            <MoreVertical size={16} />
          </button>
        </div>
        <div className="note-timestamp">
          {formatTime(note.created_at)}
        </div>
      </div>
    </div>
  );
}
