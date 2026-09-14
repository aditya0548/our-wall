import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function useNotes(spaceId, userId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId) return;

    let isMounted = true;

    // 1. Initial fetch
    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('space_id', spaceId)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        if (isMounted) {
          setNotes(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        if (isMounted) setLoading(false);
      }
    };
    fetchNotes();

    // 2. Subscribe to realtime inserts
    const channel = supabase
      .channel(`notes-${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `space_id=eq.${spaceId}`,
        },
        (payload) => {
          // Only add if not already present (avoid duplicates)
          setNotes((prev) => {
            if (prev.some((n) => n.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

  const sendNote = async (body, color) => {
    const { error } = await supabase.from('notes').insert({
      space_id: spaceId,
      author_id: userId,
      body: body.trim(),
      color: color,
    });
    if (error) throw error;
  };

  return { notes, loading, sendNote };
}
