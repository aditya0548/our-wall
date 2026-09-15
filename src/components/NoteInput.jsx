import { useState, useEffect } from 'react';
import ColorPicker from './ColorPicker';

export default function NoteInput({ onSend, currentTheme }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  
  // Persist color in localStorage
  const [color, setColor] = useState(() => {
    return localStorage.getItem('wall-preferred-color') || 'coral';
  });

  useEffect(() => {
    localStorage.setItem('wall-preferred-color', color);
  }, [color]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSend(text, color);
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
    <div className="input-container">
      <div className="input-row">
        <input 
          type="text" 
          className="note-input"
          maxLength={140}
          placeholder="Type a note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <button 
          className="send-button"
          onClick={handleSend}
          disabled={sending || !text.trim()}
        >
          {sending ? 'Sending...' : <>Send <span style={{fontSize: '12px'}}>♥</span></>}
        </button>
      </div>
      
      <ColorPicker selectedColor={color} onSelectColor={setColor} currentTheme={currentTheme} />
    </div>
  );
}
