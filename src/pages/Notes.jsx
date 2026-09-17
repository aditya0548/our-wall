import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import useSpace from '../hooks/useSpace';
import { useTheme } from '../theme/ThemeProvider';
import ProfileMenu from '../components/ProfileMenu';
import useStickyNotes from '../hooks/useStickyNotes';
import useNoteAlarms from '../hooks/useNoteAlarms';
import StickyNote from '../components/StickyNote';
import CreateNoteModal from '../components/CreateNoteModal';
import NoteAlarmModal from '../components/NoteAlarmModal';
import { supabase } from '../supabaseClient';
import '../styles/wall.css';
import '../styles/notes.css';

export default function Notes({ session }) {
  const { space, loading: spaceLoading } = useSpace(session);
  const { profile, loading: profileLoading } = useTheme();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const spaceId = space?.id;
  
  const { 
    notes, 
    loading: notesLoading, 
    addNote, 
    updateNote, 
    deleteNote 
  } = useStickyNotes(spaceId, session.user.id);
  
  const { 
    firingAlarmNote, 
    acknowledgeAlarm 
  } = useNoteAlarms(notes, session.user.id, updateNote);

  if (spaceLoading || profileLoading || (spaceId && notesLoading)) {
    return (
      <div className="wall-container" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div style={{ margin: 'auto', color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  // If not paired, send them to home
  if (!space || !space.isFull) {
    return <Navigate to="/" replace />;
  }

  if (!profile) {
    return <Navigate to="/setup" replace />;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        await updateNote(editingNote.id, noteData);
      } else {
        // Random position between 0.2 and 0.8 to avoid edges
        const pos_x = 0.2 + Math.random() * 0.6;
        const pos_y = 0.2 + Math.random() * 0.6;
        await addNote({ ...noteData, position_x: pos_x, position_y: pos_y });
      }
      setIsCreateModalOpen(false);
      setEditingNote(null);
    } catch (e) {
      console.error('Error saving note:', e);
      alert('Failed to save note.');
    }
  };

  return (
    <div className="wall-container" style={{ backgroundColor: 'var(--bg-color)' }}>
      <header className="wall-header">
        <h1 className="wall-title display-font">♥ Our Wall</h1>
        <div className="header-right">
          <ProfileMenu 
            onSignOutClick={handleLogout} 
          />
        </div>
      </header>

      <main className="sticky-canvas">
        {notes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            isAuthor={note.author_id === session.user.id}
            isFiring={firingAlarmNote?.id === note.id}
            onUpdatePosition={(id, x, y) => updateNote(id, { position_x: x, position_y: y })}
            onEdit={(n) => {
              setEditingNote(n);
              setIsCreateModalOpen(true);
            }}
            onDelete={deleteNote}
            onAcknowledgeAlarm={async (id) => {
              await updateNote(id, { alarm_acknowledged_at: new Date().toISOString() });
            }}
          />
        ))}

        <button 
          className="fab-add-note" 
          onClick={() => {
            setEditingNote(null);
            setIsCreateModalOpen(true);
          }}
        >
          +
        </button>
      </main>

      {isCreateModalOpen && (
        <CreateNoteModal
          initialData={editingNote}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingNote(null);
          }}
          onSave={handleSaveNote}
        />
      )}

      {firingAlarmNote && (
        <NoteAlarmModal
          note={firingAlarmNote}
          onAcknowledge={acknowledgeAlarm}
        />
      )}
    </div>
  );
}
