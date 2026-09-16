import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useTheme } from '../theme/ThemeProvider';
import ProfileMenu from '../components/ProfileMenu';
import '../styles/settings.css';
import '../styles/wall.css'; // For header styles

export default function Settings({ session }) {
  const { profile, updateProfile, loading } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    display_name: '',
    pronouns: '',
    birthday: ''
  });
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        pronouns: profile.pronouns || '',
        birthday: profile.birthday || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setEmail(data.user.email);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile(formData);
      setToast('Profile updated');
      setTimeout(() => {
        setToast('');
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading && !profile) {
    return (
      <div className="settings-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <header className="wall-header">
        <h1 className="wall-title display-font">
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>♥ Our Wall</Link>
        </h1>
        <div className="header-right">
          <ProfileMenu onSignOutClick={handleLogout} />
        </div>
      </header>

      <main className="settings-main">
        <div className="settings-card">
          <div className="settings-header">
            <h2 className="settings-title display-font">Settings</h2>
            <p className="settings-subtitle">Update your profile</p>
          </div>

          <form className="settings-form" onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                className="form-input" 
                value={email} 
                disabled 
              />
            </div>

            <div className="form-group">
              <label htmlFor="display_name">Display name</label>
              <input 
                type="text" 
                id="display_name"
                name="display_name"
                className="form-input" 
                maxLength={20}
                value={formData.display_name} 
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pronouns">Pronouns</label>
              <select 
                id="pronouns"
                name="pronouns"
                className="form-select" 
                value={formData.pronouns}
                onChange={handleChange}
              >
                <option value="">Select pronouns</option>
                <option value="she/her">she/her</option>
                <option value="he/him">he/him</option>
                <option value="they/them">they/them</option>
                <option value="custom">custom / other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="birthday">Birthday</label>
              <input 
                type="date" 
                id="birthday"
                name="birthday"
                className="form-input" 
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>

            <div className="settings-actions">
              <button 
                type="submit" 
                className="primary-button"
                disabled={saving || !formData.display_name.trim()}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              
              <Link to="/" className="back-link">
                Back to wall
              </Link>
            </div>
          </form>
        </div>
      </main>

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}
