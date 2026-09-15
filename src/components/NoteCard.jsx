import { noteColorMaps } from '../theme/themes';

export default function NoteCard({ note, isOwn, profile, partnerProfile, currentTheme }) {
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'just now';
    const date = new Date(dateStr);
    const diffMs = new Date() - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAuthorName = () => {
    if (isOwn) {
      return profile?.display_name || 'You';
    } else {
      return partnerProfile?.display_name || 'Partner';
    }
  };

  const authorName = getAuthorName();
  
  // Find mapped hex color for current theme
  const palette = noteColorMaps[currentTheme || 'sakura'];
  const bgColor = palette[note.color] || palette['coral'];

  return (
    <div className="note-card" style={{ backgroundColor: bgColor }}>
      <p className="note-body">{note.body}</p>
      <div className="note-footer">
        <span>— {authorName}</span>
        <span>{formatRelativeTime(note.created_at)}</span>
      </div>
    </div>
  );
}
