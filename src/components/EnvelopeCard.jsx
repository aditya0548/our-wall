import React from 'react';
import { Mail, MailOpen } from 'lucide-react';

export default function EnvelopeCard({ envelope, isOwn, onClick }) {
  const isOpened = !!envelope.opened_at;
  const now = new Date();
  const unlockDate = new Date(envelope.unlock_at);
  const isLocked = unlockDate > now;
  const isReadyToOpen = !isLocked && !isOpened;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  let statusText = '';
  if (isOpened) {
    statusText = `Opened ${formatDate(envelope.opened_at)}`;
  } else if (isLocked) {
    statusText = `Opens ${formatDate(envelope.unlock_at)}`;
  } else {
    statusText = 'Ready to open';
  }

  let cardClass = 'envelope-card';
  if (isOpened) cardClass += ' opened';
  else if (isReadyToOpen) cardClass += ' ready';
  else if (isLocked) cardClass += ' locked';
  if (isOwn) cardClass += ' own';

  return (
    <div className={cardClass} onClick={onClick}>
      <div className="envelope-icon-wrapper">
        {isOpened ? <MailOpen size={24} /> : <Mail size={24} />}
        {isOwn && <div className="own-indicator" />}
      </div>
      <div className="envelope-title">{envelope.title}</div>
      <div className="envelope-status">{statusText}</div>
    </div>
  );
}
