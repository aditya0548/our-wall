import React, { useState } from 'react';
import useSpace from '../hooks/useSpace';
import useEnvelopes from '../hooks/useEnvelopes';
import ProfileMenu from '../components/ProfileMenu';
import EnvelopeCard from '../components/EnvelopeCard';
import CreateEnvelopeModal from '../components/CreateEnvelopeModal';
import OpenEnvelopeModal from '../components/OpenEnvelopeModal';
import { supabase } from '../supabaseClient';
import '../styles/wall.css';
import '../styles/openwhen.css';

export default function OpenWhen({ session }) {
  const { space, loading: spaceLoading } = useSpace(session);
  const spaceId = space?.id;
  const userId = session?.user?.id;
  
  const { envelopes, loading, createEnvelope, markAsOpened } = useEnvelopes(spaceId, userId);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEnvelope, setSelectedEnvelope] = useState(null);
  const [lockedModalEnvelope, setLockedModalEnvelope] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCreateSubmit = async (title, body, unlockAt) => {
    try {
      await createEnvelope(title, body, unlockAt);
      setIsCreateModalOpen(false);
      showToast('Envelope sealed ✦');
    } catch (error) {
      console.error('Error creating envelope:', error);
      alert('Failed to seal envelope.');
    }
  };

  const handleEnvelopeClick = (envelope) => {
    const unlockDate = new Date(envelope.unlock_at);
    const now = new Date();
    
    if (unlockDate > now) {
      setLockedModalEnvelope(envelope);
    } else {
      setSelectedEnvelope(envelope);
    }
  };
  
  const handleOpenEnvelope = async (envelope) => {
    if (!envelope.opened_at && envelope.sender_id !== userId) {
      try {
        await markAsOpened(envelope.id);
      } catch (error) {
        console.error('Error marking as opened:', error);
      }
    }
    setSelectedEnvelope(null);
  };

  if (spaceLoading || loading) {
    return (
      <div className="wall-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ color: 'var(--text-muted)' }}>Loading envelopes...</div>
      </div>
    );
  }

  const sortedEnvelopes = [...envelopes].sort((a, b) => {
    // Unopened envelopes first, sorted by unlock date (soonest first)
    if (!a.opened_at && !b.opened_at) {
      return new Date(a.unlock_at) - new Date(b.unlock_at);
    }
    if (!a.opened_at) return -1;
    if (!b.opened_at) return 1;
    // Then opened envelopes, sorted by opened_at (most recent first)
    return new Date(b.opened_at) - new Date(a.opened_at);
  });

  return (
    <div className="wall-container">
      <header className="wall-header">
        <h1 className="wall-title display-font">♥ Our Wall</h1>
        <div className="header-right">
          <ProfileMenu onSignOutClick={handleLogout} />
        </div>
      </header>

      <main className="openwhen-main">
        <div className="openwhen-header">
          <h2 className="display-font">Open When ✦</h2>
          <button className="primary-button" onClick={() => setIsCreateModalOpen(true)}>
            + New
          </button>
        </div>

        {sortedEnvelopes.length === 0 ? (
          <div className="openwhen-empty">
            <div className="empty-icon">✉</div>
            <p>No envelopes yet. Write your first Open When.</p>
            <button className="primary-button" onClick={() => setIsCreateModalOpen(true)}>
              + Create envelope
            </button>
          </div>
        ) : (
          <div className="envelopes-grid">
            {sortedEnvelopes.map((env) => (
              <EnvelopeCard 
                key={env.id} 
                envelope={env} 
                isOwn={env.sender_id === userId}
                onClick={() => handleEnvelopeClick(env)}
              />
            ))}
          </div>
        )}
      </main>

      <CreateEnvelopeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <OpenEnvelopeModal 
        envelope={selectedEnvelope} 
        onClose={() => handleOpenEnvelope(selectedEnvelope)}
      />

      {lockedModalEnvelope && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="display-font">Not yet...</h3>
            <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
              This envelope opens on {new Date(lockedModalEnvelope.unlock_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}. Come back then.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="primary-button" onClick={() => setLockedModalEnvelope(null)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
