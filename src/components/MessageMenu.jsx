import React, { useEffect, useRef } from 'react';
import { Heart, Pin, Reply, Copy, Trash2 } from 'lucide-react';
import '../styles/messagemenu.css';

export default function MessageMenu({ position, isMine, onClose, onAction }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    // Slight delay to prevent immediate close if trigger click propagates
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const handleAction = (action) => {
    onAction(action);
    onClose();
  };

  return (
    <div 
      className="message-menu"
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
    >
      <button className="menu-item" onClick={() => handleAction('react')}>
        <Heart size={16} /> React
      </button>
      <button className="menu-item" onClick={() => handleAction('pin')}>
        <Pin size={16} /> Pin
      </button>
      <button className="menu-item" onClick={() => handleAction('reply')}>
        <Reply size={16} /> Reply
      </button>
      <button className="menu-item" onClick={() => handleAction('copy')}>
        <Copy size={16} /> Copy
      </button>
      {isMine && (
        <>
          <div className="menu-divider" />
          <button className="menu-item danger" onClick={() => handleAction('delete')}>
            <Trash2 size={16} /> Delete
          </button>
        </>
      )}
    </div>
  );
}
