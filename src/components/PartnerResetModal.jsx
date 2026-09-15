import React from 'react';

export default function PartnerResetModal({ isOpen, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="reset-modal-overlay">
      <div className="reset-modal-card">
        <h2 className="reset-modal-title display-font">Your partner reset the space.</h2>
        <p className="reset-modal-body">
          Ask them for the new code to reconnect.
        </p>
        <div className="reset-modal-actions">
          <button className="reset-modal-confirm single-button" onClick={onConfirm}>OK</button>
        </div>
      </div>
    </div>
  );
}
