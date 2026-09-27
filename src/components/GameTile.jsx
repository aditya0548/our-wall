import React from 'react';


export default function GameTile({ title, icon: Icon, onClick }) {
  return (
    <button onClick={onClick} className="game-tile" style={{ border: 'none', appearance: 'none', width: '180px', height: '180px' }}>
      <Icon size={48} className="game-tile-icon" />
      <span className="game-tile-label">{title}</span>
    </button>
  );
}
