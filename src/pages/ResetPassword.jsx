import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import '../styles/auth.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  
  const [sessionValid, setSessionValid] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setSessionValid(false);
      }
      setCheckingSession(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: apiError } = await supabase.auth.updateUser({
        password: password
      });

      if (apiError) throw apiError;

      setToastMessage('Password updated ✦');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Link expired. Request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return <div className="auth-container"><div style={{ color: 'var(--text-muted)' }}>Loading...</div></div>;
  }

  if (!sessionValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title display-font" style={{ fontSize: '28px' }}>Link expired</h1>
            <p className="auth-subtitle">This password reset link is invalid or expired. Request a new one.</p>
          </div>
          <div className="auth-footer" style={{ marginTop: '32px' }}>
            <Link to="/forgot-password" className="auth-button" style={{ textDecoration: 'none' }}>Request new link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title display-font" style={{ fontSize: '28px' }}>Set a new password</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label className="input-label">New password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"}
                className="auth-input"
                style={{ width: '100%', paddingRight: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Confirm new password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                className="auth-input"
                style={{ width: '100%', paddingRight: '40px' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute', right: '12px',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error-banner">
              {error}
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading && <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
