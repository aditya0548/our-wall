import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ShareCodeScreen({ space, onCancel }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(space.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancel = async () => {
    // Delete the space completely, which cascades to space_members
    await supabase.from('spaces').delete().eq('id', space.id);
    onCancel();
  };

  return (
    <div className="pairing-state-1">
      <div className="pairing-header">
        <h2 className="pairing-title">Share this code with your partner</h2>
      </div>
      
      <div className="waiting-card">
        <div className="code-display-box">
          <span className="code-text">{space.code}</span>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <p className="card-text" style={{ marginBottom: '40px' }}>
          When they enter it, you'll be connected.
        </p>
        
        <div className="waiting-status">
          Waiting for your partner to join
          <span className="dots">...</span>
        </div>
        
        <button className="secondary-button" onClick={handleCancel}>
          Cancel space
        </button>
      </div>
    </div>
  );
}
