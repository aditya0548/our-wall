import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function NoteInput({ onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

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
      <button className="emoji-btn" disabled={sending}>
        😊
      </button>
      <input
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
