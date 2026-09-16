import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const clientOptions = {
  realtime: {
    transport: typeof WebSocket !== 'undefined' ? WebSocket : undefined,
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions)
