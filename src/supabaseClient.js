import { createClient } from '@supabase/supabase-js'

// Explicitly provide WebSocket to the Supabase client.
// This is required for Realtime to work in production builds (Vercel).
const clientOptions = {
  realtime: {
    // Force the client to use the global WebSocket (available in browsers)
    // without relying on the client's internal detection.
    params: {
      eventsPerSecond: 10,
    },
  },
}

// In browser environments, WebSocket is always available globally.
// This explicit check forces the Supabase client to pick it up.
if (typeof window !== 'undefined' && window.WebSocket) {
  clientOptions.realtime.transport = window.WebSocket
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  clientOptions
)
