import React from 'react';
import SideNav from '../components/SideNav';
import '../styles/wall.css';

export default function Notes() {
  return (
    <div className="wall-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <SideNav />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--surface-border)', maxWidth: '400px', width: '90%' }}>
          <h2 className="display-font" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Sticky notes ✦</h2>
          <p style={{ color: 'var(--text-muted)' }}>Coming soon. Your sticky notes will live here.</p>
        </div>
      </main>
    </div>
  );
}
