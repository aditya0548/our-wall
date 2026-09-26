import React from 'react';
import { Pencil } from 'lucide-react';
import '../styles/profilecolumn.css';

export default function ProfileColumn({ profile, isMe, status, side, children }) {
  const avatarUrl = profile?.avatarUrl; 
  const displayName = profile?.display_name || (isMe ? 'Me' : 'Partner');
  
  const isOnline = status === 'online';

  const handleCustomizeClick = () => {
    console.log('customize clicked'); // TODO: wire to actual profile edit flow
  };

  return (
    <div className={`profile-column ${side === 'left' ? 'side-left' : 'side-right'}`}>
      <div className="profile-card">
        <div className="avatar-wrapper">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="profile-avatar" />
          ) : (
            <div className="profile-avatar-fallback">
              {displayName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className={`status-dot-large ${isOnline ? 'online' : 'offline'}`} />
        </div>
        
        <h2 className="profile-name">{displayName}</h2>
        
        <div className="profile-status-text">
          <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>●</span>
          {isOnline ? 'Online' : 'Offline'}
        </div>

        {isMe && (
          <button className="customize-btn" onClick={handleCustomizeClick}>
            <Pencil size={14} /> Customize
          </button>
        )}
      </div>

      <div className="profile-children">
        {children}
      </div>

      {side === 'left' && (
        <div className="flower-decoration">
          <svg width="40" height="60" viewBox="0 0 40 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 60 Q20 30 10 10" />
            <path d="M20 40 Q30 30 35 15" />
            <circle cx="10" cy="10" r="4" fill="var(--bg-app)" />
            <circle cx="35" cy="15" r="3" fill="var(--bg-app)" />
            <circle cx="20" cy="20" r="2" fill="currentColor" />
          </svg>
        </div>
      )}
    </div>
  );
}
