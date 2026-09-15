export default function NoteCard({ note, isOwn }) {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    
    // Check if it's today
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();
                    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && 
                        date.getMonth() === yesterday.getMonth() && 
                        date.getFullYear() === yesterday.getFullYear();

    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const timeStr = date.toLocaleTimeString('en-US', timeOptions);

    if (isToday) return timeStr;
    if (isYesterday) return `Yesterday ${timeStr}`;
    
    const dateOptions = { month: 'short', day: 'numeric' };
    return `${date.toLocaleDateString('en-US', dateOptions)}, ${timeStr}`;
  };

  return (
    <div className={`note-card ${isOwn ? 'own' : 'partner'}`}>
      <p className="note-body">{note.body}</p>
      <div className="note-footer">
        <span>{formatTime(note.created_at)}</span>
      </div>
    </div>
  );
}
