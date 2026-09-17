import React, { useState } from 'react';
import { Undo2, Trash2, Pen, Eraser } from 'lucide-react';

export const COLORS = [
  { id: 'coral',    value: '#F4B8A8' },
  { id: 'lavender', value: '#C9B8E8' },
  { id: 'sky',      value: '#A8C8E8' },
  { id: 'mint',     value: '#A8D8C8' },
  { id: 'sunset',   value: '#F4C8A0' },
  { id: 'sand',     value: '#E8D8C0' },
];

export const SIZES = [
  { id: 'thin',   px: 2, visualSize: 8 },
  { id: 'medium', px: 4, visualSize: 12 },
  { id: 'thick',  px: 8, visualSize: 18 },
];

export default function WhiteboardControls({ 
  selectedColor, onColorChange, 
  selectedSize, onSizeChange,
  selectedTool, onToolChange,
  onUndo, onClear, canUndo 
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearClick = () => setShowClearConfirm(true);
  const handleCancelClear = () => setShowClearConfirm(false);
  const handleConfirmClear = () => {
    onClear();
    setShowClearConfirm(false);
  };

  return (
    <div className="whiteboard-toolbar">
      {/* Colors */}
      <div className="toolbar-section">
        {COLORS.map(c => (
          <button
            key={c.id}
            className={`color-btn ${selectedColor === c.id ? 'selected' : ''}`}
            style={{ backgroundColor: c.value }}
            onClick={() => onColorChange(c.id)}
            title={c.id}
          />
        ))}
      </div>

      <div className="toolbar-divider" />

      {/* Sizes */}
      <div className="toolbar-section">
        {SIZES.map(s => (
          <button
            key={s.id}
            className={`size-btn ${selectedSize === s.px ? 'selected' : ''}`}
            onClick={() => onSizeChange(s.px)}
            title={`${s.id} brush`}
          >
            <div className="size-dot" style={{ width: s.visualSize, height: s.visualSize }} />
          </button>
        ))}
      </div>

      <div className="toolbar-divider" />

      {/* Tools */}
      <div className="toolbar-section">
        <button
          className={`tool-btn ${selectedTool === 'pen' ? 'selected' : ''}`}
          onClick={() => onToolChange('pen')}
          title="Pen"
        >
          <Pen size={18} />
        </button>
        <button
          className={`tool-btn ${selectedTool === 'eraser' ? 'selected' : ''}`}
          onClick={() => onToolChange('eraser')}
          title="Eraser"
        >
          <Eraser size={18} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Actions */}
      <div className="toolbar-section">
        <button 
          className="tool-btn" 
          onClick={onUndo} 
          disabled={!canUndo}
          title="Undo your last stroke"
        >
          <Undo2 size={18} />
        </button>
        <button 
          className="tool-btn clear-btn" 
          onClick={handleClearClick}
          title="Clear whiteboard"
        >
          <Trash2 size={18} />
        </button>
      </div>

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
