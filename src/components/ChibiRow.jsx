import React, { useState } from 'react';
import Chibi from './Chibi';
import ChibiReactions from './ChibiReactions';
import useChibiReactions from '../hooks/useChibiReactions';
import '../styles/chibi.css';

export default function ChibiRow({ spaceId, session, profile, partnerProfile }) {
  const currentUserId = session?.user?.id;
  const partnerId = partnerProfile?.user_id; // wait, is it user_id or id?

  const { reactions, sendReaction } = useChibiReactions(spaceId, currentUserId);
  const [activeChibiPicker, setActiveChibiPicker] = useState(null); // userId

  const handleChibiClick = (userId, e) => {
    e.stopPropagation();
    setActiveChibiPicker(activeChibiPicker === userId ? null : userId);
  };

  const handleSelectReaction = (userId, reactionId) => {
    sendReaction(userId, reactionId);
    setActiveChibiPicker(null);
  };

  // We need to figure out partner profile theme, or default to profile theme
  const partnerTheme = partnerProfile?.theme || profile?.theme || 'sakura';
  const myTheme = profile?.theme || 'sakura';

  const myReaction = reactions[currentUserId] || 'idle';
  const partnerReaction = partnerId ? (reactions[partnerId] || 'idle') : 'idle';

  return (
    <div className="chibi-row">
      {/* Partner Chibi */}
      <div className="chibi-col">
        {activeChibiPicker === partnerId && (
          <ChibiReactions 
            isOpen={true} 
            onClose={() => setActiveChibiPicker(null)} 
            onSelect={(reaction) => handleSelectReaction(partnerId, reaction)} 
          />
        )}
        <Chibi 
          theme={partnerTheme} 
          reaction={partnerReaction} 
          isMine={false}
          name={partnerProfile?.display_name || 'Partner'}
          onClick={(e) => handleChibiClick(partnerId, e)}
        />
      </div>

      {/* My Chibi */}
      <div className="chibi-col">
        {activeChibiPicker === currentUserId && (
          <ChibiReactions 
            isOpen={true} 
            onClose={() => setActiveChibiPicker(null)} 
            onSelect={(reaction) => handleSelectReaction(currentUserId, reaction)} 
          />
        )}
        <Chibi 
          theme={myTheme} 
          reaction={myReaction} 
          isMine={true}
          name={profile?.display_name || 'You'}
          onClick={(e) => handleChibiClick(currentUserId, e)}
        />
      </div>
    </div>
  );
}
