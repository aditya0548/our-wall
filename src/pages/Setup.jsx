import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeProvider';
import ThemePicker from '../components/ThemePicker';
import Sparkle from '../components/Sparkle';
import '../styles/setup.css';

export default function Setup() {
  const { profile, updateProfile } = useTheme();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [pronouns, setPronouns] = useState(profile?.pronouns || '');
  const [theme, setTheme] = useState(profile?.theme || 'sakura');
  const [birthday, setBirthday] = useState(profile?.birthday || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.length > 20) return;
    
    setIsSubmitting(true);
    setError('');
    
    // Use an IIFE so we don't return a Promise to React's onSubmit,
    // avoiding the React 19 Action unmount crash.
    (async () => {
      try {
        await updateProfile({
          display_name: displayName.trim(),
          pronouns,
          theme,
          birthday: birthday || null
        });
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Failed to save profile', err);
        setError(err.message || 'Failed to save profile. Please try again.');
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1 className="display-font">Set up your space <Sparkle className="title-sparkle" /></h1>
          <p className="setup-subtitle">A few things so we can make it yours.</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label>Display name</label>
            <input 
              type="text" 
              maxLength={20}
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What should we call you?"
            />
          </div>

          <div className="form-group">
            <label>Pronouns <span className="optional">(optional)</span></label>
            <select value={pronouns} onChange={(e) => setPronouns(e.target.value)}>
              <option value="">Prefer not to say</option>
              <option value="she/her">she/her</option>
              <option value="he/him">he/him</option>
              <option value="they/them">they/them</option>
              <option value="custom">custom</option>
            </select>
          </div>

          <div className="form-group">
            <label>Theme</label>
            <ThemePicker selectedTheme={theme} onSelect={setTheme} />
          </div>

          <div className="form-group">
            <label>Birthday <span className="optional">(optional)</span></label>
            <input 
              type="date" 
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>

          {error && <div className="setup-error" style={{ color: 'var(--accent-red)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

          <button type="submit" disabled={isSubmitting || !displayName.trim()} className="setup-submit">
            {isSubmitting ? 'Saving...' : <>Let's go <Sparkle /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
