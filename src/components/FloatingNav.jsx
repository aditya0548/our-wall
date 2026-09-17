import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, StickyNote, Mail, Palette, Gamepad2, Sparkles, X } from 'lucide-react';
import '../styles/nav.css';

const NAV_ITEMS = [
  { id: 'chat',       label: 'Chat',       icon: MessageCircle, route: '/' },
  { id: 'notes',      label: 'Notes',      icon: StickyNote,    route: '/notes' },
  { id: 'open-when',  label: 'Open When',  icon: Mail,          route: '/open-when' },
  { id: 'whiteboard', label: 'Whiteboard', icon: Palette,       route: '/whiteboard' },
  { id: 'games',      label: 'Games',      icon: Gamepad2,      route: '/games' },
];

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef(null);
  const fabRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 150); // Matches the exit animation duration
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  const handleNavigate = (route) => {
    navigate(route);
    handleClose();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        fabRef.current &&
        !fabRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
        fabRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Don't render on login, setup, settings, etc.
  const hiddenRoutes = ['/login', '/setup', '/forgot-password', '/reset-password', '/settings'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <button
        ref={fabRef}
        className={`floating-fab ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {(isOpen || isClosing) && (
        <div
          ref={menuRef}
          className={`floating-menu ${isClosing ? 'closing' : ''}`}
          role="menu"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.route ||
              (item.route !== '/' && location.pathname.startsWith(item.route + '/'));

            return (
              <button
                key={item.id}
                role="menuitem"
                className={`floating-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.route)}
              >
                <div className="menu-icon">
                  <Icon size={18} />
                </div>
                <span className="menu-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
