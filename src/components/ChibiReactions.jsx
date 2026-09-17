import React, { useEffect, useRef } from 'react';
import '../styles/chibi.css';

const REACTION_OPTIONS = [
  { id: 'idle', icon: '😊' },
  { id: 'wave', icon: '👋' },
  { id: 'love', icon: '💗' },
  { id: 'sleepy', icon: '😴' },
  { id: 'blush', icon: '😳' },
  { id: 'grumpy', icon: '😠' },
];

export default function ChibiReactions({ isOpen, onClose, onSelect }) {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="chibi-reactions-popup" ref={popupRef}>
      {REACTION_OPTIONS.map((r) => (
        <button 
          key={r.id} 
          className="chibi-reaction-btn" 
          onClick={() => {
            onSelect(r.id);
            onClose();
          }}
          title={r.id}
        >
          {r.icon}
        </button>
      ))}
    </div>
  );
}
