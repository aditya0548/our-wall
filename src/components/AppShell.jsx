import React, { useState } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import ProfileColumn from './ProfileColumn';
import useProfile from '../hooks/useProfile';
import Wall from '../pages/Wall';
import ResetModal from './ResetModal';
import { supabase } from '../supabaseClient';
import '../styles/appshell.css';

export default function AppShell({ session, space }) {
  const [activeFeature, setActiveFeature] = useState('chat');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const { profile, partnerProfile } = useProfile(session);

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

  return (
    <div className="app-shell">
      <Header 
        space={space} 
        onAvatarClick={() => setIsProfileOpen(!isProfileOpen)} 
        onResetClick={() => setIsResetModalOpen(true)}
      />
      
      <main className="app-main">
        {/* Left Column: My Profile */}
        <aside className={`column-left ${isProfileOpen ? 'mobile-open' : ''}`}>
          <ProfileColumn 
            profile={profile} 
            isMe={true} 
            status="online" 
            side="left"
          >
            <div className="placeholder-card">My Pinned Note goes here</div>
          </ProfileColumn>
        </aside>

        {/* Center Column: Active Feature */}
        <section className="column-center">
          {activeFeature === 'chat' ? (
            <Wall session={session} spaceId={space?.id} />
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              {activeFeature} coming soon
            </div>
          )}
        </section>

        {/* Right Column: Partner Profile + Notes */}
        <aside className={`column-right ${isProfileOpen ? 'mobile-open' : ''}`}>
          <ProfileColumn 
            profile={partnerProfile} 
            isMe={false} 
            status={partnerProfile ? 'online' : 'offline'} 
            side="right"
          >
             <div className="placeholder-card">Notes Stack goes here</div>
          </ProfileColumn>
        </aside>
      </main>

      <BottomNav activeFeature={activeFeature} onFeatureChange={setActiveFeature} />

      <ResetModal 
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />
      
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
