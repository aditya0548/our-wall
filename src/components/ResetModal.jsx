import React from 'react';
import { createPortal } from 'react-dom';

export default function ResetModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="reset-modal-overlay">
      <div className="reset-modal-card">
        <h2 className="reset-modal-title display-font">Reset your connection?</h2>
        <p className="reset-modal-body">
          This will disconnect you from your partner. Your notes will be saved, but your partner will need the new code to reconnect.
        </p>
        <div className="reset-modal-actions">
          <button className="reset-modal-cancel" onClick={onClose}>Cancel</button>
          <button className="reset-modal-confirm" onClick={onConfirm}>Reset</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
