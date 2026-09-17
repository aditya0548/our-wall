import React from 'react';
import useSpace from '../hooks/useSpace';
import useStrokes from '../hooks/useStrokes';
import NavWheel from '../components/NavWheel';
import ProfileMenu from '../components/ProfileMenu';
import WhiteboardCanvas from '../components/WhiteboardCanvas';
import WhiteboardControls from '../components/WhiteboardControls';
import { supabase } from '../supabaseClient';
import '../styles/wall.css';
import '../styles/whiteboard.css';

export default function Whiteboard({ session }) {
  const { space, loading: spaceLoading } = useSpace(session);
  const spaceId = space?.id;
  const userId = session?.user?.id;
  
  const { strokes, loading: strokesLoading, addStroke, undoLast, clearAll } = useStrokes(spaceId, userId);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const userStrokes = strokes.filter(s => s.author_id === userId);
  const canUndo = userStrokes.length > 0;

  if (spaceLoading || strokesLoading) {
    return (
      <div className="wall-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ color: 'var(--text-muted)' }}>Loading whiteboard...</div>
      </div>
    );
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

      <main className="whiteboard-main">
        <div className="whiteboard-header">
          <h2 className="display-font whiteboard-title">Whiteboard ✦</h2>
          <WhiteboardControls 
            onUndo={undoLast} 
            onClear={clearAll} 
            canUndo={canUndo} 
          />
        </div>

        <WhiteboardCanvas 
          strokes={strokes} 
          onAddStroke={addStroke} 
        />
      </main>
    </div>
  );
}
