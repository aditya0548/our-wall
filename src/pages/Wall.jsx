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

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

const ReactionPickerOverlay = ({ position, onSelect, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div ref={ref} className="reaction-picker-menu" style={{ top: position.y, left: position.x }}>
      {REACTION_EMOJIS.map(e => (
        <button key={e} className="reaction-picker-btn" onClick={() => onSelect(e)}>
          {e}
        </button>
      ))}
    </div>
  );
};

export default function Wall({ session, spaceId }) {
  const { notes, loading, sendNote, deleteNote, reactions, toggleReaction } = useNotes(spaceId, session.user.id);
  const { profile, partnerProfile } = useTheme();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPartnerResetModalOpen, setIsPartnerResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [menuState, setMenuState] = useState({ isOpen: false, noteId: null, position: { x: 0, y: 0 } });
  const [reactionPickerState, setReactionPickerState] = useState({ isOpen: false, noteId: null, position: { x: 0, y: 0 } });
  
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleMenuAction = async (action) => {
    const noteId = menuState.noteId;
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    if (action === 'copy') {
      await navigator.clipboard.writeText(note.body);
      showToast('Copied');
    } else if (action === 'delete') {
      try {
        await deleteNote(noteId);
        showToast('Message deleted');
      } catch (err) {
        showToast('Failed to delete');
      }
    } else if (action === 'pin' || action === 'reply') {
      showToast('Coming soon');
    } else if (action === 'react') {
      setReactionPickerState({
        isOpen: true,
        noteId: noteId,
        position: menuState.position
      });
    }
  };

  if (loading) {
    return (
      <div className="wall-chat" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading your chat...</div>
      </div>
    );
  }

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
                showDivider = true;
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
                    reactions={reactions[note.id] || []}
                    onReactionClick={toggleReaction}
                    currentUserId={session.user.id}
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

      {reactionPickerState.isOpen && (
        <ReactionPickerOverlay 
          position={reactionPickerState.position}
          onSelect={(emoji) => {
            toggleReaction(reactionPickerState.noteId, emoji);
            setReactionPickerState({ isOpen: false, noteId: null, position: { x: 0, y: 0 } });
          }}
          onClose={() => setReactionPickerState({ isOpen: false, noteId: null, position: { x: 0, y: 0 } })}
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
