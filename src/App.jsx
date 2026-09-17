import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Notes from './pages/Notes';
import Settings from './pages/Settings';
import OpenWhen from './pages/OpenWhen';
import Whiteboard from './pages/Whiteboard';
import { ThemeProvider } from './theme/ThemeProvider';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading...</div>;
  }

  return (
    <ThemeProvider session={session}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/forgot-password" element={!session ? <ForgotPassword /> : <Navigate to="/" replace />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/setup" element={session ? <Setup session={session} /> : <Navigate to="/login" replace />} />
          <Route path="/" element={session ? <Home session={session} /> : <Navigate to="/login" replace />} />
          <Route path="/notes" element={session ? <Notes session={session} /> : <Navigate to="/login" replace />} />
          <Route path="/open-when" element={session ? <OpenWhen session={session} /> : <Navigate to="/login" replace />} />
          <Route path="/whiteboard" element={session ? <Whiteboard session={session} /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={session ? <Settings session={session} /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
