import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function CreateEnvelopeModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [unlockAt, setUnlockAt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !unlockAt) return;
    
    const selectedDate = new Date(unlockAt);
    if (selectedDate <= new Date()) {
      alert('Unlock date must be in the future.');
      return;
    }
    
    onSubmit(title, body, selectedDate.toISOString());
    setTitle('');
    setBody('');
    setUnlockAt('');
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const modalContent = (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3 className="display-font" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Seal an envelope</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Open when you miss me"
              maxLength={60}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--surface-border)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Note</label>
            <textarea 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your note here..."
              maxLength={2000}
              required
              rows={4}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--surface-border)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Unlock Date</label>
            <input 
              type="datetime-local" 
              value={unlockAt}
              onChange={(e) => setUnlockAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--surface-border)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="modal-actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">Seal envelope</button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
