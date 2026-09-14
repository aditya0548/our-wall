import { supabase } from '../supabaseClient';

export default function ConnectedScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="pairing-state-1">
      <div className="connected-card">
        <div className="heart-icon">♥</div>
        
        <h2 className="pairing-title" style={{ marginBottom: '16px' }}>
          You're connected!
        </h2>
        
        <p className="card-text" style={{ marginBottom: '40px' }}>
          You and your partner now share a private space.
        </p>
        
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-panel-left)', borderRadius: '12px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          [ The wall comes next ]
        </div>
        
        <button className="secondary-button" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
