import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function useSpace(session) {
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  const fetchSpace = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Find the space the user belongs to
      const { data: memberData, error: memberError } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!memberData) {
        setSpace(null);
        setLoading(false);
        return;
      }

      // Fetch space details and member count
      const [spaceRes, countRes] = await Promise.all([
        supabase
          .from('spaces')
          .select('*')
          .eq('id', memberData.space_id)
          .single(),
        supabase
          .from('space_members')
          .select('user_id', { count: 'exact', head: true })
          .eq('space_id', memberData.space_id)
      ]);

      if (spaceRes.error) throw spaceRes.error;

      setSpace({
        id: spaceRes.data.id,
        code: spaceRes.data.connection_code,
        isFull: spaceRes.data.is_full,
        memberCount: countRes.count
      });

    } catch (err) {
      console.error('Error fetching space:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Initial load
  useEffect(() => {
    fetchSpace();
  }, [fetchSpace]);

  // Polling logic for State 2 (1 member)
  useEffect(() => {
    if (space && space.memberCount === 1) {
      pollIntervalRef.current = setInterval(() => {
        // Just poll the count
        supabase
          .from('space_members')
          .select('user_id', { count: 'exact', head: true })
          .eq('space_id', space.id)
          .then(({ count, error }) => {
            if (!error && count === 2) {
              fetchSpace(); // Refresh full state to get isFull=true
            }
          });
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [space, fetchSpace]);

  return { space, loading, refresh: fetchSpace };
}

export function subscribeToReset(spaceId, onReset) {
  const channelName = `space-${spaceId}`;
    supabase.getChannels().forEach(c => { if (c.topic === `realtime:${channelName}`) supabase.removeChannel(c); });
    console.log('[realtime] subscribing to', channelName);
    const channel = supabase.channel(channelName)
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'spaces', 
        filter: `id=eq.${spaceId}` 
      },
      (payload) => {
        if (payload.new.deleted_at) {
          onReset();
        }
      }
    )
    .subscribe();

  return () => {
    console.log('[realtime] unsubscribing', channelName);
    supabase.removeChannel(channel);
  };
}
