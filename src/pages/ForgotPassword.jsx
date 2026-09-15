import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';
import '../styles/auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const { error: apiError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://our-wall-neon.vercel.app/reset-password',
      });

      if (apiError) throw apiError;
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      if (err.message && err.message.toLowerCase().includes('not found')) {
         // Treat as success to prevent enumeration
         setSuccess(true);
      } else {
         setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {success ? (
          <>
            <div className="auth-header">
              <h1 className="auth-title display-font" style={{ fontSize: '28px' }}>Check your email</h1>
              <p className="auth-subtitle">
                We sent a reset link to <strong>{email}</strong>. Click it to set a new password.
              </p>
            </div>
            <div className="auth-footer" style={{ marginTop: '32px' }}>
              <Link to="/login" className="auth-toggle-btn">Back to sign in</Link>
            </div>
          </>
        ) : (
          <>
            <div className="auth-header">
              <h1 className="auth-title display-font" style={{ fontSize: '28px' }}>Reset your password</h1>
              <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input 
                  type="email" 
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="auth-error-banner">
                  {error}
                </div>
              )}

              <button type="submit" className="auth-button" disabled={loading}>
                {loading && <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            
            <div className="auth-footer">
              <Link to="/login" className="auth-toggle-btn">← Back to sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
