import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [k, v] = line.split('=')
    env[k] = v.trim()
  }
})

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY'])
async function main() {
  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password'
  })
  if (authError) {
    console.log('auth failed', authError)
    // we can still just try to query
  }
  
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  console.log('Profiles data:', data)
  console.log('Error:', error)
}
main()
