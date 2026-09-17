import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function useStrokes(spaceId, userId) {
  const [strokes, setStrokes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId) return;

    // Fetch initial strokes
    const fetchStrokes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('strokes')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching strokes:', error);
      } else {
        setStrokes(data || []);
      }
      setLoading(false);
    };

    fetchStrokes();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`strokes_space_${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'strokes',
          filter: `space_id=eq.${spaceId}`,
        },
        (payload) => {
          setStrokes((current) => {
            const newPointsStr = JSON.stringify(payload.new.points);
            const localIdx = current.findIndex(
              (s) =>
                s.author_id === payload.new.author_id &&
                String(s.id).startsWith('local-') &&
                JSON.stringify(s.points) === newPointsStr
            );

            if (localIdx >= 0) {
              const copy = [...current];
              copy[localIdx] = payload.new;
              return copy;
            }
            
            if (current.some((s) => s.id === payload.new.id)) return current;
            return [...current, payload.new];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'strokes',
        },
        (payload) => {
          setStrokes((current) => current.filter((s) => s.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

  const addStroke = async (points, colorId = 'coral', sizePx = 4) => {
    if (!spaceId || !userId) return;

    const tempStroke = {
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      space_id: spaceId,
      author_id: userId,
      points,
      color: colorId,
      size: sizePx,
      created_at: new Date().toISOString(),
    };

    setStrokes((current) => [...current, tempStroke]);

    const { error } = await supabase
      .from('strokes')
      .insert({
        space_id: spaceId,
        author_id: userId,
        points,
        color: colorId,
        size: sizePx,
      });

    if (error) {
      console.error('Error adding stroke:', error);
      // rollback on error
      setStrokes((current) => current.filter(s => s.id !== tempStroke.id));
    }
  };

  const deleteStroke = async (strokeId) => {
    if (!spaceId || !userId) return;

    const { error } = await supabase
      .from('strokes')
      .delete()
      .eq('id', strokeId);

    if (error) {
      console.error('Error deleting stroke:', error);
    }
  };

  const undoLast = async () => {
    if (!spaceId || !userId) return;

    // Find the most recent stroke by the current user
    const userStrokes = strokes.filter((s) => s.author_id === userId);
    if (userStrokes.length === 0) return;
    
    // Get the last stroke ID
    const lastStrokeId = userStrokes[userStrokes.length - 1].id;

    if (String(lastStrokeId).startsWith('local-')) {
      console.warn('Cannot undo in-flight stroke yet');
      return;
    }

    const { error } = await supabase
      .from('strokes')
      .delete()
      .eq('id', lastStrokeId);

    if (error) {
      console.error('Error undoing stroke:', error);
    }
  };

  const clearAll = async () => {
    if (!spaceId) return;

    const { error } = await supabase
      .from('strokes')
      .delete()
      .eq('space_id', spaceId);

    if (error) {
      console.error('Error clearing strokes:', error);
    }
  };

  return { strokes, loading, addStroke, deleteStroke, undoLast, clearAll };
}
