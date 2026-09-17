import React from 'react';
import { Gamepad2 } from 'lucide-react';
import NavWheel from '../components/NavWheel';
import ProfileMenu from '../components/ProfileMenu';
import GameTile from '../components/GameTile';
import { supabase } from '../supabaseClient';
import '../styles/wall.css';
import '../styles/games.css';

export default function Games({ session }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="wall-container">
      <NavWheel />
      <header className="wall-header">
        <h1 className="wall-title display-font">♥ Our Wall</h1>
        <div className="header-right">
          <ProfileMenu onSignOutClick={handleLogout} />
        </div>
      </header>

      <main className="games-main">
        <div className="games-header-row">
          <h2 className="display-font games-title">Games ✦</h2>
        </div>
        
        <div className="games-grid">
          <GameTile 
            title="Tic-Tac-Toe" 
            icon={Gamepad2} 
            to="/games/tic-tac-toe" 
          />
        </div>

        <div className="games-coming-soon">
          More games coming soon ✦
        </div>
      </main>
    </div>
  );
}
