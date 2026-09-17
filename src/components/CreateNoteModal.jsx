import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const COLORS = ['coral', 'mint', 'lavender', 'sky'];
const SIZES = ['small', 'medium', 'large'];

export default function CreateNoteModal({ onClose, onSave, initialData = null }) {
  const [body, setBody] = useState(initialData?.body || '');
  const [color, setColor] = useState(initialData?.color || 'coral');
  const [size, setSize] = useState(initialData?.size || 'medium');
  const [hasAlarm, setHasAlarm] = useState(!!initialData?.alarm_at);
  const [alarmAt, setAlarmAt] = useState(
    initialData?.alarm_at ? new Date(initialData.alarm_at).toISOString().slice(0, 16) : ''
  );

  const handleSave = () => {
    if (!body.trim()) return;
    
    let finalAlarm = null;
    if (hasAlarm && alarmAt) {
      finalAlarm = new Date(alarmAt).toISOString();
    }
    
    onSave({ body, color, size, alarm_at: finalAlarm });
  };

  const setPreset = (type) => {
    const now = new Date();
    if (type === '1h') now.setHours(now.getHours() + 1);
    else if (type === '3h') now.setHours(now.getHours() + 3);
    else if (type === 'tonight') {
      now.setHours(20, 0, 0, 0);
      if (now < new Date()) now.setDate(now.getDate() + 1); // if already past 8pm
    }
    else if (type === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(8, 0, 0, 0);
    }
    
    // adjust to local timezone string for datetime-local input
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
    setAlarmAt(localISOTime);
  };

  const modalContent = (
    <div className="note-modal-overlay" onClick={onClose}>
      <div className="note-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: 0 }}>{initialData ? 'Edit Note' : 'New Note'}</h3>
        
        <textarea
          className="note-textarea"
          placeholder="What's on your mind? (max 200 chars)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={200}
          autoFocus
        />
        
        <div className="note-options-row">
          <div className="color-picker">
            {COLORS.map(c => (
              <div 
                key={c} 
                className={`color-swatch color-${c} ${color === c ? 'selected' : ''}`}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="size-picker">
            {SIZES.map(s => (
              <button 
                key={s} 
                className={`size-btn ${size === s ? 'selected' : ''}`}
                onClick={() => setSize(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="alarm-section">
          <div className="alarm-header">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={hasAlarm} onChange={(e) => setHasAlarm(e.target.checked)} />
              Set an alarm
            </label>
          </div>
          
          {hasAlarm && (
            <div>
              <div className="alarm-presets">
                <button className="alarm-preset-btn" onClick={() => setPreset('1h')}>In 1 hour</button>
                <button className="alarm-preset-btn" onClick={() => setPreset('3h')}>In 3 hours</button>
                <button className="alarm-preset-btn" onClick={() => setPreset('tonight')}>Tonight 8pm</button>
                <button className="alarm-preset-btn" onClick={() => setPreset('tomorrow')}>Tomorrow 8am</button>
              </div>
              <input 
                type="datetime-local" 
                value={alarmAt} 
                onChange={(e) => setAlarmAt(e.target.value)}
                style={{ marginTop: '12px', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}
              />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={!body.trim()}>Save</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
