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
    <div className="chibi-row layout-asymmetric">
      {/* Partner Chibi (Large, Interactive) */}
      <div className="chibi-col chibi-partner-col">
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
          size="large"
          name={partnerProfile?.display_name || 'Partner'}
          onClick={(e) => handleChibiClick(partnerId, e)}
        />
      </div>

      {/* My Chibi (Small, Decorative) */}
      <div className="chibi-col chibi-mine-col">
        <Chibi 
          theme={myTheme} 
          reaction={myReaction} 
          isMine={true}
          size="small"
          name={profile?.display_name || 'You'}
          // No onClick for your own chibi
        />
      </div>
    </div>
  );
}
