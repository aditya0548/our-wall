import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export default function useTicTacToe(spaceId, userId) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGame = useCallback(async () => {
    if (!spaceId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tic_tac_toe_games')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setGame(data);
      } else {
        // Create new game
        const { data: partnerData } = await supabase
          .from('space_members')
          .select('user_id')
          .eq('space_id', spaceId);
        
        let playerXId = userId;
        if (partnerData && partnerData.length > 0) {
          const members = partnerData.map(m => m.user_id);
          playerXId = members[Math.floor(Math.random() * members.length)];
        }

        const { data: newGame, error: createError } = await supabase
          .from('tic_tac_toe_games')
          .insert({
            space_id: spaceId,
            player_x_user_id: playerXId,
            current_turn_user_id: playerXId,
            board: ["","","","","","","","",""]
          })
          .select()
          .single();

        if (createError) throw createError;
        setGame(newGame);
      }
    } catch (err) {
      console.error('Error fetching/creating tic-tac-toe game:', err);
    } finally {
      setLoading(false);
    }
  }, [spaceId, userId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    if (!spaceId) return;
    const channelName = `tic_tac_toe_${spaceId}`;
    supabase.getChannels().forEach(c => { if (c.topic === `realtime:${channelName}`) supabase.removeChannel(c); });
    console.log('[realtime] subscribing to', channelName);
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tic_tac_toe_games', filter: `space_id=eq.${spaceId}` },
        (payload) => {
          setGame(payload.new);
        }
      )
      .subscribe();
    return () => {
      console.log('[realtime] unsubscribing', channelName);
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

  const makeMove = async (cellIndex) => {
    if (!game || game.current_turn_user_id !== userId || game.winner_user_id || game.is_draw || game.board[cellIndex] !== "") return;

    const newBoard = [...game.board];
    const mark = game.player_x_user_id === userId ? "X" : "O";
    newBoard[cellIndex] = mark;

    let winnerId = null;
    for (const [a, b, c] of LINES) {
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        winnerId = userId;
        break;
      }
    }

    let isDraw = false;
    if (!winnerId && !newBoard.includes("")) {
      isDraw = true;
    }

    let nextTurnId = null;
    if (!winnerId && !isDraw) {
      // Find partner ID
      const { data: members } = await supabase
        .from('space_members')
        .select('user_id')
        .eq('space_id', spaceId);
      
      const partner = members?.find(m => m.user_id !== userId);
      nextTurnId = partner ? partner.user_id : userId; // Fallback
    }

    let newWinsX = game.wins_x || 0;
    let newWinsO = game.wins_o || 0;
    let newDraws = game.draws || 0;

    if (winnerId) {
      if (game.player_x_user_id === winnerId) {
        newWinsX += 1;
      } else {
        newWinsO += 1;
      }
    } else if (isDraw) {
      newDraws += 1;
    }

    try {
      const { data: updatedGame, error } = await supabase
        .from('tic_tac_toe_games')
        .update({
          board: newBoard,
          current_turn_user_id: nextTurnId,
          winner_user_id: winnerId,
          is_draw: isDraw,
          wins_x: newWinsX,
          wins_o: newWinsO,
          draws: newDraws,
          updated_at: new Date().toISOString()
        })
        .eq('id', game.id)
        .select()
        .single();
      
      if (error) throw error;
      setGame(updatedGame);
    } catch (err) {
      console.error('Error making move:', err);
    }
  };

  const playAgain = async () => {
    if (!game) return;
    
    // Concurrency guard: Only reset if the game is actually ended.
    if (!game.winner_user_id && !game.is_draw) return;

    try {
      // Re-fetch to ensure we're looking at the latest before reset, to avoid race conditions.
      const { data: latestGame } = await supabase
        .from('tic_tac_toe_games')
        .select('winner_user_id, is_draw')
        .eq('id', game.id)
        .single();
        
      if (!latestGame || (!latestGame.winner_user_id && !latestGame.is_draw)) {
        return;
      }

      const { data: members } = await supabase
        .from('space_members')
        .select('user_id')
        .eq('space_id', spaceId);
        
      const allMembers = members?.map(m => m.user_id) || [userId];
      
      let nextFirst = game.player_x_user_id;
      if (game.winner_user_id) {
         // Loser goes first
         nextFirst = allMembers.find(id => id !== game.winner_user_id) || nextFirst;
      } else {
         // Random on draw
         nextFirst = allMembers[Math.floor(Math.random() * allMembers.length)];
      }

      const { data: updatedGame, error } = await supabase
        .from('tic_tac_toe_games')
        .update({
          board: ["","","","","","","","",""],
          current_turn_user_id: nextFirst,
          player_x_user_id: nextFirst,
          winner_user_id: null,
          is_draw: false,
          game_number: game.game_number + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', game.id)
        .select()
        .single();

      if (error) throw error;
      setGame(updatedGame);
    } catch (err) {
      console.error('Error playing again:', err);
    }
  };

  return { game, loading, makeMove, playAgain };
}
