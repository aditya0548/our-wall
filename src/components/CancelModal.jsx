import React from 'react';
import { createPortal } from 'react-dom';

export default function CancelModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="reset-modal-overlay" onClick={onClose}>
      <div className="reset-modal-card" onClick={(e) => e.stopPropagation()}>
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

  return createPortal(modalContent, document.body);
}
