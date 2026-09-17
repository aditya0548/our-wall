import React, { useRef, useState } from 'react';

export default function StickyNote({ 
  note, 
  isAuthor, 
  onUpdatePosition, 
  onEdit, 
  onDelete, 
  isFiring, 
  onAcknowledgeAlarm 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const noteRef = useRef(null);

  const handlePointerDown = (e) => {
    if (!isAuthor || e.button !== 0) return; // Only left click and author
    // Ignore if clicking on buttons
    if (e.target.closest('button') || e.target.closest('.sticky-author-badge') || e.target.closest('.alarm-badge')) return;

    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = parseFloat(note.position_x);
    const startTop = parseFloat(note.position_y);

    const container = noteRef.current.parentElement;
    const rect = container.getBoundingClientRect();

    const handlePointerMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) / rect.width;
      const dy = (moveEvent.clientY - startY) / rect.height;

      let newX = startLeft + dx;
      let newY = startTop + dy;

      newX = Math.max(0, Math.min(0.90, newX));
      newY = Math.max(0, Math.min(0.90, newY));

      if (noteRef.current) {
        noteRef.current.style.left = `${newX * 100}%`;
        noteRef.current.style.top = `${newY * 100}%`;
      }
    };

    const handlePointerUp = (upEvent) => {
      setIsDragging(false);
      upEvent.target.releasePointerCapture(upEvent.pointerId);
      
      noteRef.current.removeEventListener('pointermove', handlePointerMove);
      noteRef.current.removeEventListener('pointerup', handlePointerUp);
      noteRef.current.removeEventListener('pointercancel', handlePointerUp);

      const dx = (upEvent.clientX - startX) / rect.width;
      const dy = (upEvent.clientY - startY) / rect.height;

      let newX = startLeft + dx;
      let newY = startTop + dy;

      newX = Math.max(0, Math.min(0.90, newX));
      newY = Math.max(0, Math.min(0.90, newY));

      if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
        onUpdatePosition(note.id, newX, newY);
      }
    };

    noteRef.current.addEventListener('pointermove', handlePointerMove);
    noteRef.current.addEventListener('pointerup', handlePointerUp);
    noteRef.current.addEventListener('pointercancel', handlePointerUp);
  };

  const hasAlarmSet = note.alarm_at && !note.alarm_acknowledged_at && !note.alarm_fired_at;
  const isMissedAlarm = note.alarm_at && !note.alarm_acknowledged_at && !note.alarm_fired_at && new Date(note.alarm_at) < new Date();

  const authorInitial = note.author_id ? note.author_id.substring(0, 2) : '?'; // Real initial might require profiles join, fallback to ID prefix for now

  return (
    <div
      ref={noteRef}
      className={`sticky-note size-${note.size || 'medium'} color-${note.color || 'coral'} ${isDragging ? 'dragging' : ''} ${isFiring ? 'alarm-firing' : ''}`}
      style={{
        left: `${note.position_x * 100}%`,
        top: `${note.position_y * 100}%`,
        touchAction: 'none' // Prevent scrolling while dragging on mobile
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="sticky-header">
        {hasAlarmSet && !isFiring && !isMissedAlarm && (
          <div className="alarm-icon-corner">🔔</div>
        )}
      </div>
      
      {isAuthor && (
        <div className="sticky-actions">
          <button className="sticky-action-btn" onClick={() => onEdit(note)}>✏️</button>
          <button className="sticky-action-btn" onClick={() => {
            if (window.confirm('Delete this note?')) {
              onDelete(note.id);
            }
          }}>❌</button>
        </div>
      )}

      {/* Author badge can just be generic if we don't have profile names */}
      <div className="sticky-author-badge">{authorInitial}</div>

      <div className="sticky-content">
        {note.body}
      </div>

      {isMissedAlarm && (
        <div className="alarm-badge missed" onClick={(e) => {
          e.stopPropagation();
          onAcknowledgeAlarm(note.id);
        }}>
          🔔 Missed
        </div>
      )}
    </div>
  );
}
