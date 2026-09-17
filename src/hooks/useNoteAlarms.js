import { useEffect, useState } from 'react';

export default function useNoteAlarms(notes, userId, updateNote) {
  const [firingAlarmNote, setFiringAlarmNote] = useState(null);

  useEffect(() => {
    const checkAlarms = () => {
      if (!notes || notes.length === 0) return;
      
      const now = new Date();
      
      for (const note of notes) {
        if (note.alarm_at && !note.alarm_fired_at) {
          const alarmTime = new Date(note.alarm_at);
          if (alarmTime <= now) {
            // Is it for me? (I am not the author)
            if (note.author_id !== userId) {
              triggerAlarm(note);
            }
          }
        }
      }
    };

    const intervalId = setInterval(checkAlarms, 15000); // Check every 15s
    // Check immediately on mount
    checkAlarms();

    return () => clearInterval(intervalId);
  }, [notes, userId]);

  const triggerAlarm = async (note) => {
    // Only set if not already firing
    setFiringAlarmNote(prev => {
      if (prev && prev.id === note.id) return prev;
      
      // Play chime
      playChime();
      
      // Update DB to mark as fired
      updateNote(note.id, { alarm_fired_at: new Date().toISOString() }).catch(err => console.error("Error setting alarm_fired_at:", err));
      
      return note;
    });
  };

  const acknowledgeAlarm = async () => {
    if (firingAlarmNote) {
      await updateNote(firingAlarmNote.id, { alarm_acknowledged_at: new Date().toISOString() });
      setFiringAlarmNote(null);
    }
  };

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880; // A5
        osc.type = 'sine';
        
        const startTime = ctx.currentTime + delay;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);
        
        osc.start(startTime);
        osc.stop(startTime + 1.2);
      };
      
      playTone(0);
      playTone(0.3); // Play twice with a small gap
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  return { firingAlarmNote, acknowledgeAlarm, playChime };
}
