import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const COLORS = ['coral', 'mint', 'lavender', 'sky'];
const SHAPES = ['square', 'round'];

const THEME_TO_DEFAULT_COLOR = {
  sakura:   'coral',
  ocean:    'sky',
  matcha:   'mint',
  midnight: 'lavender',
};

const TEMPLATES = [
  { label: 'Reminder', text: "Don't forget to " },
  { label: 'Love', text: "I love you ❤️" },
  { label: 'Running late', text: "Running a bit late, sorry!" },
  { label: 'Thinking of you', text: "Thinking of you ✨" },
  { label: 'Surprise', text: "Surprise! Check the chat 👀" },
  { label: 'Clear', text: "" },
];

export default function CreateNoteModal({ onClose, onSave, initialData = null, userTheme = 'sakura' }) {
  const [body, setBody] = useState(initialData?.body || '');
  const [color, setColor] = useState(initialData?.color || THEME_TO_DEFAULT_COLOR[userTheme] || 'coral');
  const [shape, setShape] = useState(initialData?.shape || 'square');
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
    
    onSave({ body, color, shape, alarm_at: finalAlarm });
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
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="note-modal-overlay" style={{ background: 'none', backdropFilter: 'none', pointerEvents: 'none' }}>
        <div className="note-modal-content" style={{ pointerEvents: 'auto', zIndex: 1000 }} onClick={(e) => e.stopPropagation()}>
          <h2 className="note-modal-title">{initialData ? 'Edit Note' : 'New Note'}</h2>
        
        <div className="templates-scroll">
          {TEMPLATES.map(t => (
            <button 
              key={t.label} 
              className="template-chip"
              onClick={() => setBody(t.text)}
            >
              {t.label}
            </button>
          ))}
        </div>

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
        </div>

        <div className="shape-picker">
          <span style={{ fontSize: '12px', marginRight: '8px' }}>Shape:</span>
          {SHAPES.map(s => (
            <button 
              key={s}
              className={`shape-btn ${shape === s ? 'selected' : ''}`}
              onClick={() => setShape(s)}
            >
              {s === 'square' ? '□ Square' : '○ Round'}
            </button>
          ))}
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
                style={{ marginTop: '12px', width: '100%', padding: '8px', borderRadius: '4px' }}
              />
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={!body.trim()}>Save</button>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
