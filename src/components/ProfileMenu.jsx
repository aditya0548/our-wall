import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPen, Palette, Settings, RotateCcw, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import ChangeThemeModal from './ChangeThemeModal';
import { useTheme } from '../theme/ThemeProvider';
import '../styles/menu.css';

export default function ProfileMenu({ onResetClick, onSignOutClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { profile } = useTheme();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleAction = (action) => {
    setIsOpen(false);
    switch (action) {
      case 'edit_profile':
      case 'settings':
        navigate('/settings');
        break;
      case 'change_theme':
        setIsThemeModalOpen(true);
        break;
      case 'reset_connection':
        if (onResetClick) onResetClick();
        break;
      case 'sign_out':
        if (onSignOutClick) onSignOutClick();
        break;
      default:
        break;
    }
  };

  // We fetch session user email from supabase, or assume it's passed somehow.
  // Actually, wait, useTheme doesn't give session. But the requirement is to show email.
  // Let's get the email directly from supabase auth, or from session if available.
  // I will just use a state to fetch the user email if we need it.
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  return (
    <div className="profile-menu-container" ref={menuRef}>
      <button 
        className="user-avatar-btn" 
        onClick={handleToggle}
        aria-expanded={isOpen}
        title={profile?.display_name || 'Profile'}
      >
        {getInitials(profile?.display_name)}
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">
              {getInitials(profile?.display_name)}
            </div>
            <div className="profile-dropdown-info">
              <span className="profile-dropdown-name">{profile?.display_name || 'Anonymous'}</span>
              <span className="profile-dropdown-email">{userEmail}</span>
            </div>
          </div>
          
          <div className="profile-dropdown-divider"></div>
          
          <button className="profile-menu-item" onClick={() => handleAction('edit_profile')}>
            <UserPen size={16} />
            Edit profile
          </button>
          
          <button className="profile-menu-item" onClick={() => handleAction('change_theme')}>
            <Palette size={16} />
            Change theme
          </button>
          
          <button className="profile-menu-item" onClick={() => handleAction('settings')}>
            <Settings size={16} />
            Settings
          </button>
          
          <div className="profile-dropdown-divider"></div>
          
          <button className="profile-menu-item" onClick={() => handleAction('reset_connection')}>
            <RotateCcw size={16} />
            Reset connection
          </button>
          
          <div className="profile-dropdown-divider"></div>
          
          <button className="profile-menu-item" onClick={() => handleAction('sign_out')}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}

      <ChangeThemeModal 
        isOpen={isThemeModalOpen} 
        onClose={() => setIsThemeModalOpen(false)} 
      />
    </div>
  );
}
