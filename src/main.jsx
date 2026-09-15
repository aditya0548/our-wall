import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import { supabase } from './supabaseClient'

// Log realtime status in dev/prod for debugging
if (typeof window !== 'undefined') {
  window.supabase = supabase  // expose for debugging
  console.log('[app] supabase client initialized')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
