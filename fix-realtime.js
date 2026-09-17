import fs from 'fs';

const files = [
  'src/hooks/useNotes.js',
  'src/hooks/useStrokes.js',
  'src/hooks/useChibiReactions.js',
  'src/hooks/useSpace.js',
  'src/hooks/useTicTacToe.js'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // We'll replace the channel creation with the guarded version and logging
  // Since each file has slightly different channel creation, we'll do them individually using replace()
  
  // 1. useNotes.js
  if (file.includes('useNotes')) {
    content = content.replace(
      /const channel = supabase\s*\.channel\(`notes-\$\{spaceId\}`\)/,
      "const channelName = `notes-${spaceId}`;\n    supabase.getChannels().forEach(c => { if (c.topic === `realtime:${channelName}`) supabase.removeChannel(c); });\n    console.log('[realtime] subscribing to', channelName);\n    const channel = supabase.channel(channelName)"
    ).replace(
      /supabase\.removeChannel\(channel\);/g,
      "console.log('[realtime] unsubscribing', channelName);\n      supabase.removeChannel(channel);"
    );
  }
  
  // 2. useStrokes.js
  if (file.includes('useStrokes')) {
    content = content.replace(
      /const channel = supabase\s*\.channel\(`strokes_space_\$\{spaceId\}`\)/,
      "const channelName = `strokes_space_${spaceId}`;\n    supabase.getChannels().forEach(c => { if (c.topic === `realtime:${channelName}`) supabase.removeChannel(c); });\n    console.log('[realtime] subscribing to', channelName);\n    const channel = supabase.channel(channelName)"
    ).replace(
      /supabase\.removeChannel\(channel\);/g,
      "console.log('[realtime] unsubscribing', channelName);\n      supabase.removeChannel(channel);"
    );
  }
  
  // 3. useChibiReactions.js
  if (file.includes('useChibiReactions')) {
    content = content.replace(
      /const channel = supabase\.channel\(`chibi-\$\{spaceId\}`\);/,
      "const channelName = `chibi-${spaceId}`;\n    supabase.getChannels().forEach(c => { if (c.topic === `realtime:${channelName}`) supabase.removeChannel(c); });\n    console.log('[realtime] subscribing to', channelName);\n    const channel = supabase.channel(channelName);"
    ).replace(
      /supabase\.removeChannel\(channel\);/g,
      "console.log('[realtime] unsubscribing', channelName);\n      supabase.removeChannel(channel);"
    );
  }
  
  // 4. useTicTacToe.js
  if (file.includes('useTicTacToe')) {
    content = content.replace(
      /const channel = supabase\.channel\(`tic_tac_toe_\$\{spaceId\}`\)/,
      "const channelName = `tic_tac_toe_${spaceId}`;\n    supabase.getChannels().forEach(c => { if (c.topic === `realtime:${channelName}`) supabase.removeChannel(c); });\n    console.log('[realtime] subscribing to', channelName);\n    const channel = supabase.channel(channelName)"
    ).replace(
      /supabase\.removeChannel\(channel\);/g,
      "console.log('[realtime] unsubscribing', channelName);\n      supabase.removeChannel(channel);"
    );
  }
  
  // 5. useSpace.js
  if (file.includes('useSpace')) {
    content = content.replace(
      /const channel = supabase\s*\.channel\(`space-\$\{spaceId\}`\)/,
      "const channelName = `space-${spaceId}`;\n    supabase.getChannels().forEach(c => { if (c.topic === `realtime:${channelName}`) supabase.removeChannel(c); });\n    console.log('[realtime] subscribing to', channelName);\n    const channel = supabase.channel(channelName)"
    ).replace(
      /supabase\.removeChannel\(channel\);/g,
      "console.log('[realtime] unsubscribing', channelName);\n    supabase.removeChannel(channel);"
    );
  }
  
  fs.writeFileSync(file, content);
});
