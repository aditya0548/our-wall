import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import useSpace from '../hooks/useSpace';
import { useTheme } from '../theme/ThemeProvider';

export default function OpenEnvelopeModal({ envelope, onClose }) {
  const [senderName, setSenderName] = useState('');
  const { profile, partnerProfile } = useTheme();

  useEffect(() => {
    if (!envelope) return;
    if (envelope.sender_id === profile?.id) {
      setSenderName(profile.display_name || 'You');
    } else if (envelope.sender_id === partnerProfile?.id) {
      setSenderName(partnerProfile.display_name || 'Partner');
    } else {
      // Fallback to fetch if needed
      supabase.from('profiles').select('display_name').eq('id', envelope.sender_id).single()
        .then(({ data }) => {
          if (data) setSenderName(data.display_name || 'Unknown');
        });
    }
  }, [envelope, profile, partnerProfile]);

  if (!envelope) return null;

  const sealedDate = new Date(envelope.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  const openedDate = envelope.opened_at ? new Date(envelope.opened_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : null;

  const modalContent = (
    <div className="reset-modal-overlay" onClick={onClose}>
      <div className="reset-modal-card envelope-open-modal" onClick={(e) => e.stopPropagation()}>
        <div className="envelope-flap" />
        <div className="envelope-inner-content">
          <h3 className="display-font" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.5rem' }}>{envelope.title}</h3>
          <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '2rem', textAlign: 'left' }}>
            {envelope.body}
          </p>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <div>From {senderName} · Sealed {sealedDate}</div>
            {openedDate && <div>· Opened {openedDate}</div>}
          </div>
          <div className="reset-modal-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <button className="reset-modal-cancel" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
