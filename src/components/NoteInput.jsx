import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export default function NoteInput({ onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsEmojiPickerOpen(false);
      }
    };
    
    if (isEmojiPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEmojiPickerOpen]);

  const handleEmojiClick = (emojiData) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newText = text.slice(0, start) + emojiData.emoji + text.slice(end);
    setText(newText);
    
    // Restore cursor position after the inserted emoji
    requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = start + emojiData.emoji.length;
      input.focus();
    });
    setIsEmojiPickerOpen(false);
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSend(text, 'coral');
      setText('');
    } catch (err) {
      console.error('Failed to send note:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="note-input-bar">
      <div ref={containerRef} style={{ position: 'relative' }}>
        <button 
          className="emoji-btn" 
          disabled={sending}
          onClick={() => setIsEmojiPickerOpen(prev => !prev)}
        >
          😊
        </button>
        {isEmojiPickerOpen && (
          <div className="emoji-picker-wrapper">
            <EmojiPicker 
              onEmojiClick={handleEmojiClick} 
              autoFocusSearch={false}
              theme="light"
              height={350}
            />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={sending}
      />
      <button 
        className="send-btn" 
        onClick={handleSend} 
        disabled={sending || !text.trim()}
        aria-label="Send message"
      >
        <Send size={20} />
      </button>
    </div>
  );
}
