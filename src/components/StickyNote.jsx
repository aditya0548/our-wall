import React, { useRef, useState } from 'react';

export default function StickyNote({ 
  note, 
  isAuthor, 
  onUpdateNote, 
  onEdit, 
  onDelete, 
  isFiring, 
  onAcknowledgeAlarm,
  authorColor,
  authorName
}) {
  const [isDragging, setIsDragging] = useState(false);
  const noteRef = useRef(null);

  const handlePointerDown = (e) => {
    if (!isAuthor || e.button !== 0) return; // Only left click and author
    // Ignore if clicking on buttons or resize handle
    if (e.target.closest('button') || e.target.closest('.sticky-author-container') || e.target.closest('.alarm-badge') || e.target.closest('.resize-handle')) return;

    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = parseFloat(note.position_x) || 0;
    const startTop = parseFloat(note.position_y) || 0;

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
        onUpdateNote(note.id, { position_x: newX, position_y: newY });
      }
    };

    noteRef.current.addEventListener('pointermove', handlePointerMove);
    noteRef.current.addEventListener('pointerup', handlePointerUp);
    noteRef.current.addEventListener('pointercancel', handlePointerUp);
  };

  const handleResizePointerDown = (e, corner) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    
    e.target.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = parseFloat(note.width) || 160;
    const startH = parseFloat(note.height) || 160;
    const startPosX = parseFloat(note.position_x) || 0;
    const startPosY = parseFloat(note.position_y) || 0;

    let newW = startW;
    let newH = startH;
    let newX = startPosX;
    let newY = startPosY;

    const container = noteRef.current.parentElement;
    const rect = container.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    const handlePointerMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (corner === 'bottom-right') {
        newW = Math.max(100, Math.min(500, startW + dx));
        newH = Math.max(100, Math.min(500, startH + dy));
      } else if (corner === 'bottom-left') {
        newW = Math.max(100, Math.min(500, startW - dx));
        newH = Math.max(100, Math.min(500, startH + dy));
        newX = startPosX + (startW - newW) / canvasWidth;
      } else if (corner === 'top-right') {
        newW = Math.max(100, Math.min(500, startW + dx));
        newH = Math.max(100, Math.min(500, startH - dy));
        newY = startPosY + (startH - newH) / canvasHeight;
      } else if (corner === 'top-left') {
        newW = Math.max(100, Math.min(500, startW - dx));
        newH = Math.max(100, Math.min(500, startH - dy));
        newX = startPosX + (startW - newW) / canvasWidth;
        newY = startPosY + (startH - newH) / canvasHeight;
      }

      if (noteRef.current) {
        noteRef.current.style.width = `${newW}px`;
        noteRef.current.style.height = `${newH}px`;
        noteRef.current.style.left = `${newX * 100}%`;
        noteRef.current.style.top = `${newY * 100}%`;
      }
    };

    const handlePointerUp = (upEvent) => {
      upEvent.target.releasePointerCapture(upEvent.pointerId);
      
      e.target.removeEventListener('pointermove', handlePointerMove);
      e.target.removeEventListener('pointerup', handlePointerUp);
      e.target.removeEventListener('pointercancel', handlePointerUp);
      
      if (newW !== startW || newH !== startH) {
        console.log('[resize] saving', { id: note.id, width: newW, height: newH, x: newX, y: newY });
        onUpdateNote(note.id, { width: newW, height: newH, position_x: newX, position_y: newY });
      }
    };

    e.target.addEventListener('pointermove', handlePointerMove);
    e.target.addEventListener('pointerup', handlePointerUp);
    e.target.addEventListener('pointercancel', handlePointerUp);
  };

  const hasAlarmSet = note.alarm_at && !note.alarm_acknowledged_at && !note.alarm_fired_at;
  const isMissedAlarm = note.alarm_at && !note.alarm_acknowledged_at && !note.alarm_fired_at && new Date(note.alarm_at) < new Date();

  const authorInitials = authorName ? authorName.substring(0, 2).toUpperCase() : '?';
  const firstName = authorName ? authorName.split(' ')[0] : '?';

  return (
    <div
      ref={noteRef}
      className={`sticky-note color-${note.color || 'coral'} ${isDragging ? 'dragging' : ''} ${isFiring ? 'alarm-firing' : ''}`}
      style={{
        left: `${note.position_x * 100}%`,
        top: `${note.position_y * 100}%`,
        width: `${note.width || 160}px`,
        height: `${note.height || 160}px`,
        touchAction: 'none' // Prevent scrolling while dragging on mobile
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="sticky-author-strip" style={{ backgroundColor: authorColor }} />
      
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

      <div className="sticky-author-container">
        <div className="sticky-author-badge" style={{ backgroundColor: authorColor, color: '#fff' }}>
          {authorInitials}
        </div>
        <div className="sticky-author-name">{firstName}</div>
      </div>

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

      {isAuthor && (
        <>
          <div className="resize-handle top-left" onPointerDown={(e) => handleResizePointerDown(e, 'top-left')} />
          <div className="resize-handle top-right" onPointerDown={(e) => handleResizePointerDown(e, 'top-right')} />
          <div className="resize-handle bottom-left" onPointerDown={(e) => handleResizePointerDown(e, 'bottom-left')} />
          <div className="resize-handle bottom-right" onPointerDown={(e) => handleResizePointerDown(e, 'bottom-right')} />
        </>
      )}
    </div>
  );
}
