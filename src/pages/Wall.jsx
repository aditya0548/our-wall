import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import useNotes from '../hooks/useNotes';
import { useTheme } from '../theme/ThemeProvider';
import { subscribeToReset } from '../hooks/useSpace';
import NoteCard from '../components/NoteCard';
import NoteInput from '../components/NoteInput';
import Sparkle from '../components/Sparkle';
import ResetModal from '../components/ResetModal';
import PartnerResetModal from '../components/PartnerResetModal';
import ProfileMenu from '../components/ProfileMenu';
import ChibiRow from '../components/ChibiRow';
import '../styles/wall.css';

export default function Wall({ session, spaceId }) {
  const { notes, loading, sendNote } = useNotes(spaceId, session.user.id);
  const { profile, partnerProfile, theme } = useTheme();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPartnerResetModalOpen, setIsPartnerResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToReset(spaceId, () => {
      setIsPartnerResetModalOpen(true);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [spaceId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleResetClick = () => {
    setIsResetModalOpen(true);
  };

  const handleResetConfirm = async () => {
    setIsResetModalOpen(false);
    const { data, error } = await supabase.rpc('reset_current_space');
    if (!error) {
      setToastMessage('Connection reset. Share your new code.');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      console.error(error);
    }
  };

  const handlePartnerResetConfirm = () => {
    setIsPartnerResetModalOpen(false);
    window.location.reload();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  const partnerName = partnerProfile?.display_name || 'Partner';

  if (loading) {
    return (
      <div className="wall-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading your wall...</div>
      </div>
    );
  }

  // Reverse notes so newest is at the bottom
  const sortedNotes = [...notes].reverse();

  return (
    <div className="wall-container">
      <header className="wall-header">
        <h1 className="wall-title display-font">♥ Our Wall</h1>
        <div className="header-right">
          <ProfileMenu 
            onResetClick={handleResetClick} 
            onSignOutClick={handleLogout} 
          />
        </div>
      </header>
      
      <ChibiRow 
        spaceId={spaceId} 
        session={session} 
        profile={profile} 
        partnerProfile={partnerProfile} 
      />

      <main className="wall-main">
        {sortedNotes.length === 0 ? (
          <div className="empty-state">
            <Sparkle className="empty-sparkle" />
            <p>Nothing here yet. Send the first note to {partnerName}.</p>
          </div>
        ) : (
          <div className="notes-list">
            {sortedNotes.map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                isOwn={note.author_id === session.user.id}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <footer className="wall-footer">
        <NoteInput onSend={sendNote} currentTheme={theme} />
      </footer>

      <ResetModal 
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />

      <PartnerResetModal
        isOpen={isPartnerResetModalOpen}
        onConfirm={handlePartnerResetConfirm}
      />

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
