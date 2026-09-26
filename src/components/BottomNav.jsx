import React from 'react';
import { MessageCircle, StickyNote, PenTool, Gamepad2, Image } from 'lucide-react';

export default function BottomNav({ activeFeature, onFeatureChange }) {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'whiteboard', label: 'Whiteboard', icon: PenTool },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'memories', label: 'Memories', icon: Image },
  ];

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeFeature === item.id ? 'active' : ''}`}
            onClick={() => onFeatureChange(item.id)}
          >
            <item.icon className="nav-icon" size={20} />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
