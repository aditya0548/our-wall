import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function useStickyNotes(spaceId, userId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId) return;

    let isMounted = true;

    // 1. Initial fetch
    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('sticky_notes')
          .select('*')
          .eq('space_id', spaceId);

        if (error) throw error;
        if (isMounted) {
          setNotes(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching sticky notes:', err);
        if (isMounted) setLoading(false);
      }
    };
    fetchNotes();

    // 2. Subscribe to realtime inserts, updates, deletes
    const channelName = `sticky_notes-${spaceId}`;
    supabase.getChannels().forEach(c => { if (c.topic === `realtime:${channelName}`) supabase.removeChannel(c); });
    console.log('[realtime] subscribing to', channelName);
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sticky_notes',
          filter: `space_id=eq.${spaceId}`,
        },
        (payload) => {
          setNotes((prev) => {
            if (payload.eventType === 'INSERT') {
              if (prev.some((n) => n.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            } else if (payload.eventType === 'UPDATE') {
              return prev.map(n => n.id === payload.new.id ? payload.new : n);
            } else if (payload.eventType === 'DELETE') {
              return prev.filter(n => n.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      console.log('[realtime] unsubscribing', channelName);
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

  const addNote = async ({ body, color, size, alarm_at, position_x, position_y }) => {
    const { data, error } = await supabase.from('sticky_notes').insert({
      space_id: spaceId,
      author_id: userId,
      body,
      color,
      size,
      alarm_at,
      position_x,
      position_y,
    }).select().single();
    
    if (error) throw error;
    
    // Add locally immediately to ensure no lag if realtime is slow
    setNotes(prev => prev.some(n => n.id === data.id) ? prev : [...prev, data]);
    return data;
  };

  const updateNote = async (id, updates) => {
    // Optimistic update locally
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    
    const { error } = await supabase.from('sticky_notes').update(updates).eq('id', id);
    if (error) throw error;
  };

  const deleteNote = async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    
    const { error } = await supabase.from('sticky_notes').delete().eq('id', id);
    if (error) throw error;
  };

  return { notes, loading, addNote, updateNote, deleteNote };
}
