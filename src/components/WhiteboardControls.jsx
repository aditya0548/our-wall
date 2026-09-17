import React, { useState } from 'react';
import { Undo2, Trash2 } from 'lucide-react';

export default function WhiteboardControls({ onUndo, onClear, canUndo }) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearClick = () => setShowClearConfirm(true);
  const handleCancelClear = () => setShowClearConfirm(false);
  const handleConfirmClear = () => {
    onClear();
    setShowClearConfirm(false);
  };

  return (
    <div className="whiteboard-controls">
      <button 
        className="whiteboard-control-btn" 
        onClick={onUndo} 
        disabled={!canUndo}
        title="Undo your last stroke"
      >
        <Undo2 size={20} />
      </button>
      <button 
        className="whiteboard-control-btn clear-btn" 
        onClick={handleClearClick}
        title="Clear whiteboard"
      >
        <Trash2 size={20} />
      </button>

      {showClearConfirm && (
        <div className="reset-modal-overlay">
          <div className="reset-modal-card">
            <h2 className="reset-modal-title display-font">Clear Whiteboard?</h2>
            <p className="reset-modal-body">
              This will permanently delete all strokes for both you and your partner. Are you sure?
            </p>
            <div className="reset-modal-actions">
              <button className="reset-modal-cancel" onClick={handleCancelClear}>Cancel</button>
              <button className="reset-modal-confirm" onClick={handleConfirmClear}>Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
