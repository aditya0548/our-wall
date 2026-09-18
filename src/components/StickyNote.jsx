import React, { useRef, useState } from 'react';
import { Pencil, X } from 'lucide-react';

const EMOJIS = ['❤️', '😂', '😮', '🥰'];

export default function StickyNote({ 
  note, 
  isAuthor, 
  onUpdateNote, 
  onEdit, 
  onDelete, 
  isFiring, 
  onAcknowledgeAlarm,
  authorColor,
  authorName,
  reactions = [],
  currentUserId,
  onToggleReaction
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const noteRef = useRef(null);

  const handlePointerDown = (e) => {
    if (!isAuthor || e.button !== 0) return; 
    if (e.target.closest('button') || e.target.closest('.sticky-author-container') || e.target.closest('.alarm-badge') || e.target.closest('.resize-handle') || e.target.closest('.reaction-trigger') || e.target.closest('.reaction-picker') || e.target.closest('.pin-icon-corner') || e.target.closest('.reaction-pill')) return;

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
    
    const container = noteRef.current.parentElement;
    const rect = container.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    const startX = e.clientX;
    const startY = e.clientY;
    
    const startW = canvasWidth * (parseFloat(note.width_pct) || 0.28);
    const startH = canvasHeight * (parseFloat(note.height_pct) || 0.28);
    const startPosX = parseFloat(note.position_x) || 0;
    const startPosY = parseFloat(note.position_y) || 0;

    let newW = startW;
    let newH = startH;
    let newX = startPosX;
    let newY = startPosY;

    const handlePointerMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (corner === 'bottom-right') {
        newW = Math.max(80, Math.min(canvasWidth * 0.9, startW + dx));
        newH = Math.max(80, Math.min(canvasHeight * 0.9, startH + dy));
      } else if (corner === 'bottom-left') {
        newW = Math.max(80, Math.min(canvasWidth * 0.9, startW - dx));
        newH = Math.max(80, Math.min(canvasHeight * 0.9, startH + dy));
        newX = startPosX + (startW - newW) / canvasWidth;
      } else if (corner === 'top-right') {
        newW = Math.max(80, Math.min(canvasWidth * 0.9, startW + dx));
        newH = Math.max(80, Math.min(canvasHeight * 0.9, startH - dy));
        newY = startPosY + (startH - newH) / canvasHeight;
      } else if (corner === 'top-left') {
        newW = Math.max(80, Math.min(canvasWidth * 0.9, startW - dx));
        newH = Math.max(80, Math.min(canvasHeight * 0.9, startH - dy));
        newX = startPosX + (startW - newW) / canvasWidth;
        newY = startPosY + (startH - newH) / canvasHeight;
      }

      if (noteRef.current) {
        noteRef.current.style.width = `calc(${(newW / canvasWidth)} * 100%)`;
        noteRef.current.style.height = `calc(${(newH / canvasHeight)} * 100%)`;
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
        const newWidthPct = newW / canvasWidth;
        const newHeightPct = newH / canvasHeight;
        onUpdateNote(note.id, { width_pct: newWidthPct, height_pct: newHeightPct, position_x: newX, position_y: newY });
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

  const groupedReactions = EMOJIS.map(emoji => ({
    emoji,
    users: reactions.filter(r => r.emoji === emoji).map(r => r.user_id)
  })).filter(g => g.users.length > 0);

  const isRound = note.shape === 'round';
  const widthPct = parseFloat(note.width_pct) || 0.28;
  const heightPct = parseFloat(note.height_pct) || 0.28;
  
  // Approximate logic for smallness just to truncate text
  const isSmall = widthPct < 0.2 && heightPct < 0.2;
  
  let displayText = note.body || '';
  if (isRound && isSmall && displayText.length > 40) {
    displayText = displayText.substring(0, 37) + '...';
  }

  return (
    <div
      ref={noteRef}
      className={`sticky-note shape-${note.shape || 'square'} color-${note.color || 'coral'} ${isDragging ? 'dragging' : ''} ${isFiring ? 'alarm-firing' : ''} ${note.is_pinned ? 'is-pinned' : ''}`}
      style={{
        left: `${parseFloat(note.position_x) * 100 || 0}%`,
        top: `${parseFloat(note.position_y) * 100 || 0}%`,
        width: `calc(${widthPct} * 100%)`,
        height: `calc(${heightPct} * 100%)`,
        touchAction: 'none' 
      }}
      onPointerDown={handlePointerDown}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div className="sticky-author-strip" style={{ backgroundColor: authorColor }} />
      
      <div className="sticky-header">
        {isAuthor && (
          <div 
            className={`pin-icon-corner ${note.is_pinned ? 'pinned' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onUpdateNote(note.id, { is_pinned: !note.is_pinned });
            }}
          >
            📌
          </div>
        )}
        {hasAlarmSet && !isFiring && !isMissedAlarm && (
          <div className="alarm-icon-corner" style={{ left: isAuthor ? '36px' : '12px' }}>🔔</div>
        )}
      </div>
      
      {isAuthor && (
        <div className="note-hover-controls">
          <button 
            className="note-control-btn" 
            onClick={(e) => { e.stopPropagation(); onEdit(note); }}
            aria-label="Edit note"
          >
            <Pencil size={14} />
          </button>
          <button 
            className="note-control-btn note-control-btn--danger" 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Delete this note?')) {
                onDelete(note.id);
              }
            }}
            aria-label="Delete note"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="sticky-author-container" style={{ top: isRound ? '16px' : '8px', right: isRound ? '16px' : '8px' }}>
        <div className="sticky-author-badge" style={{ backgroundColor: authorColor, color: '#fff' }}>
          {authorInitials}
        </div>
        <div className="sticky-author-name">{firstName}</div>
      </div>

      <div className="sticky-content">
        {displayText}
      </div>

      {isMissedAlarm && (
        <div className="alarm-badge missed" onClick={(e) => {
          e.stopPropagation();
          onAcknowledgeAlarm(note.id);
        }}>
          🔔 Missed
        </div>
      )}

      <div className="reaction-trigger-container">
        {showReactions && (
          <div className="reaction-picker">
            {EMOJIS.map(emoji => (
              <button 
                key={emoji} 
                className="reaction-picker-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleReaction(note.id, emoji);
                  setShowReactions(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <button 
          className="reaction-trigger"
          onClick={(e) => {
            e.stopPropagation();
            setShowReactions(!showReactions);
          }}
        >
          + ❤️
        </button>
      </div>

      {groupedReactions.length > 0 && (
        <div className="reaction-pills">
          {groupedReactions.map(g => {
            const iReacted = g.users.includes(currentUserId);
            return (
              <div 
                key={g.emoji} 
                className={`reaction-pill ${iReacted ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleReaction(note.id, g.emoji);
                }}
              >
                {g.emoji} {g.users.length}
              </div>
            );
          })}
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
