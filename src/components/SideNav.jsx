import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, StickyNote, Mail, Palette, Gamepad2 } from 'lucide-react';

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: MessageCircle, label: 'Chat' },
    { path: '/notes', icon: StickyNote, label: 'Notes' },
    { path: '/open-when', icon: Mail, label: 'Open When' },
    { path: '/whiteboard', icon: Palette, label: 'Whiteboard' },
    { path: '/games', icon: Gamepad2, label: 'Games' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="side-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            className={`nav-item ${location.pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={label}
          >
            <Icon size={24} />
            <span className="nav-tooltip">{label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {navItems.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            className={`bottom-nav-item ${location.pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={24} />
            <span className="bottom-nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
