import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function useStickyNotes(spaceId, userId) {
  const [notes, setNotes] = useState([]);
  const [reactions, setReactions] = useState([]);
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
          
          if (data && data.length > 0) {
            const noteIds = data.map(n => n.id);
            const { data: reactionsData, error: rError } = await supabase
              .from('note_reactions')
              .select('*')
              .in('note_id', noteIds);
              
            if (!rError && isMounted) {
              setReactions(reactionsData || []);
            }
          }
          
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching sticky notes:', err);
        if (isMounted) setLoading(false);
      }
    };
    fetchNotes();

    // 2. Subscribe to realtime inserts, updates, deletes for sticky_notes
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'note_reactions',
        },
        (payload) => {
          setReactions((prev) => {
            if (payload.eventType === 'INSERT') {
              if (prev.some((r) => r.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            } else if (payload.eventType === 'DELETE') {
              return prev.filter(r => r.id !== payload.old.id);
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

  const addNote = async ({ body, color, shape, width_pct, height_pct, alarm_at, position_x, position_y }) => {
    const { data, error } = await supabase.from('sticky_notes').insert({
      space_id: spaceId,
      author_id: userId,
      body,
      color,
      shape,
      width_pct,
      height_pct,
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
  
  const toggleReaction = async (noteId, emoji) => {
    const existing = reactions.find(r => r.note_id === noteId && r.user_id === userId && r.emoji === emoji);
    
    if (existing) {
      // Optimistic delete
      setReactions(prev => prev.filter(r => r.id !== existing.id));
      await supabase.from('note_reactions').delete().eq('id', existing.id);
    } else {
      const tempId = `temp-${Date.now()}`;
      const newReaction = { id: tempId, note_id: noteId, user_id: userId, emoji, created_at: new Date().toISOString() };
      
      // Optimistic insert
      setReactions(prev => [...prev, newReaction]);
      
      const { data, error } = await supabase.from('note_reactions').insert({
        note_id: noteId,
        user_id: userId,
        emoji
      }).select().single();
      
      if (!error && data) {
        setReactions(prev => prev.map(r => r.id === tempId ? data : r));
      } else {
        // Revert on error
        setReactions(prev => prev.filter(r => r.id !== tempId));
      }
    }
  };

  return { notes, reactions, loading, addNote, updateNote, deleteNote, toggleReaction };
}
