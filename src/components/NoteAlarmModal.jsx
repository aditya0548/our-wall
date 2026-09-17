import React from 'react';
import { createPortal } from 'react-dom';

export default function NoteAlarmModal({ note, onAcknowledge }) {
  if (!note) return null;

  const modalContent = (
    <div className="note-modal-overlay" style={{ zIndex: 2000 }}>
      <div className="note-modal-content" style={{ alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔔</div>
        <h2 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Alarm from {note.author_id.substring(0,2)}</h2>
        <div 
          className={`sticky-note size-medium color-${note.color}`} 
          style={{ position: 'relative', transform: 'none', marginBottom: '24px', pointerEvents: 'none' }}
        >
          <div className="sticky-content">{note.body}</div>
        </div>
        
        <button className="btn-primary" onClick={onAcknowledge} style={{ width: '100%', fontSize: '16px', padding: '12px' }}>
          Got it!
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
