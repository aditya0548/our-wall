import React, { useState } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import '../styles/appshell.css';

export default function AppShell({ session, space }) {
  const [activeFeature, setActiveFeature] = useState('chat');
  
  // Mobile layout state: clicking avatar toggles profile view
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header space={space} onAvatarClick={() => setIsProfileOpen(!isProfileOpen)} />
      
      <main className="app-main">
        {/* Left Column: My Profile */}
        <aside className={`column-left ${isProfileOpen ? 'mobile-open' : ''}`}>
          <div className="placeholder-card">My Profile & Note goes here</div>
        </aside>

        {/* Center Column: Active Feature */}
        <section className="column-center">
          <div className="feature-placeholder">
            {activeFeature === 'chat' && <h2>Chat goes here</h2>}
            {activeFeature === 'notes' && <h2>Notes goes here</h2>}
            {activeFeature === 'whiteboard' && <h2>Whiteboard goes here</h2>}
            {activeFeature === 'games' && <h2>Games goes here</h2>}
            {activeFeature === 'memories' && <h2>Memories (Coming Soon)</h2>}
          </div>
        </section>

        {/* Right Column: Partner Profile + Notes */}
        <aside className={`column-right ${isProfileOpen ? 'mobile-open' : ''}`}>
           <div className="placeholder-card">Partner Profile + Notes Stack goes here</div>
        </aside>
      </main>

      <BottomNav activeFeature={activeFeature} onFeatureChange={setActiveFeature} />
    </div>
  );
}
