import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import ProfileMenu from './ProfileMenu';
import { supabase } from '../supabaseClient';

export default function Header({ space, onAvatarClick, onResetClick }) {
  const { profile } = useTheme();

  // Calculate days together
  const getDaysTogether = () => {
    if (!space?.createdAt) return 0;
    const start = new Date(space.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <span className="header-icon">♥</span> Our Wall
      </div>
      
      <div className="header-center">
        <span className="days-label">Together for</span>
        <div className="days-counter">
          <svg className="laurel-left" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21C7 21 3 17 3 12C3 7 7 3 12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 21C16 19 19 16 19 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="days-number">{getDaysTogether()}</span>
          <svg className="laurel-right" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21C17 21 21 17 21 12C21 7 17 3 12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 21C8 19 5 16 5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="days-label">days</span>
      </div>

      <div className="header-right">
        <ProfileMenu 
          onSignOutClick={() => supabase.auth.signOut()} 
          onResetClick={onResetClick}
        />
      </div>
    </header>
  );
}
