import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import '../styles/auth.css';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', confirmPassword: '', general: '' };

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
    setErrors({ email: '', password: '', confirmPassword: '', general: '' });

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
    setErrors({ email: '', password: '', confirmPassword: '', general: '' });
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  return (
    <div className="auth-container">
      {/* LEFT PANEL */}
      <div className="auth-brand-panel">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        
        <div className="auth-brand-header">
          Our Wall
        </div>
        
        <div className="auth-brand-content">
          <h1 className="auth-headline">A place that belongs to both of you.</h1>
          <p className="auth-subtext">Connect. Share. Stay close.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-form-panel">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="form-subtitle">
              {mode === 'signin' ? 'Sign in to your shared space.' : 'Start your shared space.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            
            <div className="input-group">
              <div className="input-wrapper">
                <Mail className="input-icon-left" size={20} />
                <input 
                  type="email" 
                  className="auth-input"
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <Lock className="input-icon-left" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="auth-input"
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="input-icon-right" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} className="icon-transition" /> : <Eye size={20} className="icon-transition" />}
                </button>
              </div>
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            {mode === 'signup' && (
              <div className="input-group">
                <div className="input-wrapper">
                  <Lock className="input-icon-left" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="auth-input"
                    placeholder="Confirm password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
              </div>
            )}

            {errors.general && (
              <div className="auth-error-banner">
                {errors.general}
              </div>
            )}

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading} 
            >
              {loading && <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
              {loading 
                ? (mode === 'signin' ? 'Signing in…' : 'Creating account…') 
                : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          
          <div className="auth-toggle">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button className="auth-toggle-btn" onClick={toggleMode} type="button" disabled={loading}>
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
