import React, { useState } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import ProfileColumn from './ProfileColumn';
import useProfile from '../hooks/useProfile';
import Wall from '../pages/Wall';
import '../styles/appshell.css';

export default function AppShell({ session, space }) {
  const [activeFeature, setActiveFeature] = useState('chat');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { profile, partnerProfile } = useProfile(session);

  return (
    <div className="app-shell">
      <Header space={space} onAvatarClick={() => setIsProfileOpen(!isProfileOpen)} />
      
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
    </div>
  );
}
