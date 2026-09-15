import React from 'react';

export default function CancelModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="reset-modal-overlay">
      <div className="reset-modal-card">
        <h2 className="reset-modal-title display-font">Cancel this space?</h2>
        <p className="reset-modal-body">
          You'll need to create a new one or enter a different code.
        </p>
        <div className="reset-modal-actions">
          <button className="reset-modal-cancel" onClick={onClose}>Close</button>
          <button className="reset-modal-confirm" onClick={onConfirm}>Cancel Space</button>
        </div>
      </div>
    </div>
  );
}
