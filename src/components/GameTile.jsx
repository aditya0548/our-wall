import React from 'react';
import { Link } from 'react-router-dom';

export default function GameTile({ title, icon: Icon, to }) {
  return (
    <Link to={to} className="game-tile">
      <Icon size={48} className="game-tile-icon" />
      <span className="game-tile-label">{title}</span>
    </Link>
  );
}
