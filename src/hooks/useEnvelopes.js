import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function useEnvelopes(spaceId, userId) {
  const [envelopes, setEnvelopes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId) return;

    let isMounted = true;

    const fetchEnvelopes = async () => {
      try {
        const { data, error } = await supabase
          .from('envelopes')
          .select('*')
          .eq('space_id', spaceId)
          .order('unlock_at', { ascending: true }); // We'll sort them in JS

        if (error) throw error;
        if (isMounted) {
          setEnvelopes(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching envelopes:', err);
        if (isMounted) setLoading(false);
      }
    };
    fetchEnvelopes();

    const channel = supabase
      .channel(`envelopes-${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'envelopes',
          filter: `space_id=eq.${spaceId}`,
        },
        (payload) => {
          setEnvelopes((prev) => {
            if (payload.eventType === 'INSERT') {
              if (prev.some((e) => e.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            } else if (payload.eventType === 'UPDATE') {
              return prev.map((e) => (e.id === payload.new.id ? payload.new : e));
            } else if (payload.eventType === 'DELETE') {
              return prev.filter((e) => e.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe((status, err) => {
        if (err) console.error('[realtime/envelopes] error:', err);
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

  const createEnvelope = async (title, body, unlockAt) => {
    const { error } = await supabase.from('envelopes').insert({
      space_id: spaceId,
      sender_id: userId,
      title: title.trim(),
      body: body.trim(),
      unlock_at: unlockAt,
    });
    if (error) throw error;
  };

  const markAsOpened = async (id) => {
    const { error } = await supabase
      .from('envelopes')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  };

  return { envelopes, loading, createEnvelope, markAsOpened };
}
