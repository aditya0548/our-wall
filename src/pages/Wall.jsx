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
import MessageMenu from '../components/MessageMenu';
import '../styles/wall.css';

export default function Wall({ session, spaceId }) {
  const { notes, loading, sendNote } = useNotes(spaceId, session.user.id);
  const { profile, partnerProfile } = useTheme();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPartnerResetModalOpen, setIsPartnerResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [menuState, setMenuState] = useState({ isOpen: false, noteId: null, position: { x: 0, y: 0 } });
  
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

  const partnerName = partnerProfile?.display_name || 'Partner';

  const handleMenuOpen = (noteId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuState({
      isOpen: true,
      noteId,
      position: { x: rect.right + 8, y: rect.top }
    });
  };

  const handleMenuClose = () => {
    setMenuState({ isOpen: false, noteId: null, position: { x: 0, y: 0 } });
  };

  const handleMenuAction = (action) => {
    console.log(`Action '${action}' clicked on note ${menuState.noteId}`);
  };

  if (loading) {
    return (
      <div className="wall-chat" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading your chat...</div>
      </div>
    );
  }

  // Reverse notes so newest is at the bottom
  const sortedNotes = [...notes].reverse();

  return (
    <>
      <div className="wall-chat">
        {sortedNotes.length === 0 ? (
          <div className="wall-empty">
            <Sparkle className="empty-sparkle" />
            <p>Nothing here yet. Send the first note to {partnerName}.</p>
          </div>
        ) : (
          <div className="wall-messages">
            {sortedNotes.map((note, index) => {
              const isMine = note.author_id === session.user.id;
              const authorName = isMine ? (profile?.display_name || 'Me') : partnerName;
              const authorAvatar = isMine ? profile?.avatarUrl : partnerProfile?.avatarUrl;
              
              let showDivider = false;
              if (index > 0) {
                const prevDate = new Date(sortedNotes[index - 1].created_at).toDateString();
                const currDate = new Date(note.created_at).toDateString();
                if (prevDate !== currDate) showDivider = true;
              } else {
                showDivider = true; // Always show date for the first message
              }

              return (
                <React.Fragment key={note.id}>
                  {showDivider && (
                    <div className="date-divider">
                      <span>{new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  <NoteCard 
                    note={note} 
                    isMine={isMine}
                    authorName={authorName}
                    authorAvatar={authorAvatar}
                    onMenuOpen={handleMenuOpen}
                  />
                </React.Fragment>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <NoteInput onSend={sendNote} />

      {menuState.isOpen && (
        <MessageMenu 
          position={menuState.position}
          isMine={sortedNotes.find(n => n.id === menuState.noteId)?.author_id === session.user.id}
          onClose={handleMenuClose}
          onAction={handleMenuAction}
        />
      )}

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
    </>
  );
}
