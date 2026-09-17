import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function useChibiReactions(spaceId, currentUserId) {
  const [reactions, setReactions] = useState({});
  const channelRef = useRef(null);
  const timeoutsRef = useRef({});

  useEffect(() => {
    if (!spaceId) return;

    const channelName = `chibi-${spaceId}`;
    supabase.getChannels().forEach(c => { if (c.topic === `realtime:${channelName}`) supabase.removeChannel(c); });
    console.log('[realtime] subscribing to', channelName);
    const channel = supabase.channel(channelName);
    
    channel
      .on('broadcast', { event: 'reaction' }, (event) => {
        // Depending on Supabase client version, the payload might be inside event.payload
        const data = event.payload || event;
        triggerReactionLocally(data.chibiOwnerId, data.reaction);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      console.log('[realtime] unsubscribing', channelName);
      supabase.removeChannel(channel);
      // clear all timeouts
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, [spaceId]);

  const triggerReactionLocally = (userId, reaction) => {
    if (!userId) return;
    
    setReactions(prev => ({ ...prev, [userId]: reaction }));

    if (timeoutsRef.current[userId]) {
      clearTimeout(timeoutsRef.current[userId]);
    }

    timeoutsRef.current[userId] = setTimeout(() => {
      setReactions(prev => ({ ...prev, [userId]: 'idle' }));
    }, 3000);
  };

  const sendReaction = (targetUserId, reaction) => {
    // 1. apply locally
    triggerReactionLocally(targetUserId, reaction);

    // 2. broadcast
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'reaction',
        payload: {
          chibiOwnerId: targetUserId,
          reaction: reaction,
          senderId: currentUserId,
        },
      });
    }
  };

  return { reactions, sendReaction };
}
