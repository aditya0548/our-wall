import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function useNotes(spaceId, userId) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState({});

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
          
          if (data && data.length > 0) {
            const noteIds = data.map(n => n.id);
            const { data: rxData } = await supabase
              .from('note_reactions')
              .select('*')
              .in('note_id', noteIds);
            
            if (rxData && isMounted) {
               const rxMap = {};
               rxData.forEach(r => {
                 if(!rxMap[r.note_id]) rxMap[r.note_id] = [];
                 rxMap[r.note_id].push(r);
               });
               setReactions(rxMap);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        if (isMounted) setLoading(false);
      }
    };
    fetchNotes();

    // 2. Subscribe to realtime inserts
    const channelName = `notes-${spaceId}`;
    supabase.getChannels().forEach(c => { if (c.topic === `realtime:${channelName}`) supabase.removeChannel(c); });
    console.log('[realtime] subscribing to', channelName);
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notes',
          filter: `space_id=eq.${spaceId}`,
        },
        (payload) => {
          setNotes((prev) => {
            const localIdx = prev.findIndex(
              (n) => 
                n.author_id === payload.new.author_id && 
                String(n.id).startsWith('local-') && 
                n.body === payload.new.body
            );
            
            if (localIdx >= 0) {
              const copy = [...prev];
              copy[localIdx] = payload.new;
              return copy;
            }

            if (prev.some((n) => n.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe((status, err) => {
        console.log('[realtime] status:', status)
        if (err) console.error('[realtime] full error:', JSON.stringify(err, null, 2))
      });

    return () => {
      isMounted = false;
      console.log('[realtime] unsubscribing', channelName);
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

  const sendNote = async (body, color) => {
    const tempNote = {
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      space_id: spaceId,
      author_id: userId,
      body: body.trim(),
      color: color,
      created_at: new Date().toISOString(),
    };

    setNotes((prev) => [tempNote, ...prev]);

    const { error } = await supabase.from('notes').insert({
      space_id: spaceId,
      author_id: userId,
      body: body.trim(),
      color: color,
    });
    
    if (error) {
      setNotes((prev) => prev.filter(n => n.id !== tempNote.id));
      throw error;
    }
  };

  const deleteNote = async (noteId) => {
    setNotes((prev) => prev.filter(n => n.id !== noteId));
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    if (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  const toggleReaction = async (noteId, emoji) => {
    const noteReactions = reactions[noteId] || [];
    const existing = noteReactions.find(r => r.user_id === userId && r.emoji === emoji);

    if (existing) {
      setReactions(prev => ({
        ...prev,
        [noteId]: prev[noteId].filter(r => r.id !== existing.id)
      }));
      await supabase.from('note_reactions').delete().eq('id', existing.id);
    } else {
      const tempId = `temp-${Date.now()}`;
      setReactions(prev => ({
        ...prev,
        [noteId]: [...(prev[noteId] || []), { id: tempId, note_id: noteId, user_id: userId, emoji }]
      }));
      const { data, error } = await supabase.from('note_reactions').insert({
        note_id: noteId,
        user_id: userId,
        emoji
      }).select().single();
      
      if (data) {
        setReactions(prev => ({
          ...prev,
          [noteId]: prev[noteId].map(r => r.id === tempId ? data : r)
        }));
      }
    }
  };

  return { notes, loading, sendNote, deleteNote, reactions, toggleReaction };
}
