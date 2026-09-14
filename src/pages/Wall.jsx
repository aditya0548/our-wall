import { supabase } from '../supabaseClient';
import useNotes from '../hooks/useNotes';
import NoteCard from '../components/NoteCard';
import NoteInput from '../components/NoteInput';
import '../styles/wall.css';

export default function Wall({ session, spaceId }) {
  const { notes, loading, sendNote } = useNotes(spaceId, session.user.id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="wall-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading your wall...</div>
      </div>
    );
  }

  return (
    <div className="wall-container">
      <header className="wall-header">
        <h1 className="wall-title">♥ Our Wall</h1>
        <button className="secondary-button" onClick={handleLogout}>Sign out</button>
      </header>
      
      <main className="wall-main">
        {notes.length === 0 ? (
          <div className="empty-state">
            Nothing here yet. Send the first note.
          </div>
        ) : (
          <div className="notes-list">
            {notes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                isOwn={note.author_id === session.user.id} 
              />
            ))}
          </div>
        )}
      </main>

      <footer className="wall-footer">
        <NoteInput onSend={sendNote} />
      </footer>
    </div>
  );
}
