import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';
import Sparkle from '../components/Sparkle';
import '../styles/auth.css';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', general: '' };

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAuthError = (error) => {
    let message = 'Something went wrong. Please try again.';
    const msg = error.message.toLowerCase();
    
    if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
      message = 'Email or password is incorrect.';
    } else if (msg.includes('user already registered') || msg.includes('already exists')) {
      message = 'An account with this email already exists. Try signing in.';
    } else if (msg.includes('password should be at least 6 characters') || msg.includes('password is too short')) {
      message = 'Password must be at least 6 characters.';
    }
    
    setErrors(prev => ({ ...prev, general: message }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({ email: '', password: '', general: '' });
    setPassword('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title display-font">
            {mode === 'signin' ? 'Welcome back' : 'Join our wall'} <Sparkle style={{ fontSize: '24px' }} />
          </h1>
          <p className="auth-subtitle">
            {mode === 'signin' ? 'Sign in to your shared space.' : 'Start your shared space.'}
          </p>
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
            />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>

          {errors.general && (
            <div className="auth-error-banner">
              {errors.general}
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading && <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
            {loading 
              ? (mode === 'signin' ? 'Signing in…' : 'Creating account…') 
              : (mode === 'signin' ? "Let's go" : 'Create Account')}
          </button>
        </form>
        
        <div className="auth-footer">
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button className="auth-toggle-btn" onClick={toggleMode} type="button" disabled={loading}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
