import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL.trim(), process.env.VITE_SUPABASE_ANON_KEY.trim())

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  console.log('Profiles data:', data)
  console.log('Error:', error)
}
run()
