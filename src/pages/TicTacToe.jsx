import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useSpace from '../hooks/useSpace';
import useProfile from '../hooks/useProfile';
import useTicTacToe from '../hooks/useTicTacToe';
import NavWheel from '../components/NavWheel';
import ProfileMenu from '../components/ProfileMenu';
import TicTacToeBoard from '../components/TicTacToeBoard';
import { supabase } from '../supabaseClient';
import '../styles/wall.css';
import '../styles/games.css';

export default function TicTacToe({ session }) {
  const { space, loading: spaceLoading } = useSpace(session);
  const { partnerProfile, loading: profileLoading } = useProfile(session);
  
  const spaceId = space?.id;
  const userId = session?.user?.id;
  
  const { game, loading: gameLoading, makeMove, playAgain } = useTicTacToe(spaceId, userId);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (spaceLoading || profileLoading || gameLoading) {
    return (
      <div className="wall-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ color: 'var(--text-muted)' }}>Loading game...</div>
      </div>
    );
  }

  const isMyTurn = game && !game.winner_user_id && !game.is_draw && game.current_turn_user_id === userId;
  const partnerName = partnerProfile?.display_name || 'Partner';
  
  let statusText = "";
  let statusClass = "status-waiting";

  if (game) {
    if (game.winner_user_id) {
      statusClass = "status-win";
      statusText = game.winner_user_id === userId ? "You won! 🎉" : `${partnerName} won! 🎉`;
    } else if (game.is_draw) {
      statusClass = "status-waiting";
      statusText = "It's a draw! 🤝";
    } else if (isMyTurn) {
      statusClass = "status-turn";
      statusText = "Your turn!";
    } else {
      statusClass = "status-waiting";
      statusText = `Waiting for ${partnerName}...`;
    }
  }

  return (
    <div className="wall-container">
      <NavWheel />
      <header className="wall-header">
        <h1 className="wall-title display-font">♥ Our Wall</h1>
        <div className="header-right">
          <ProfileMenu onSignOutClick={handleLogout} />
        </div>
      </header>

      <main className="games-main" style={{ alignItems: 'center' }}>
        <Link to="/games" className="tic-tac-toe-breadcrumb">
          <ArrowLeft size={16} /> Back to Games
        </Link>
        
        <h2 className="display-font games-title" style={{ marginBottom: '16px' }}>Tic-Tac-Toe ✦</h2>
        
        {game && (
          <div className="tic-tac-toe-container">
            <div className={`tic-tac-toe-status ${statusClass}`}>
              {statusText}
            </div>

            <TicTacToeBoard 
              board={game.board}
              isMyTurn={isMyTurn}
              onMove={makeMove}
              winnerId={game.winner_user_id}
              myUserId={userId}
              playerXId={game.player_x_user_id}
            />

            {(game.winner_user_id || game.is_draw) && (
              <button className="play-again-btn" onClick={playAgain}>
                Play again ✦
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
