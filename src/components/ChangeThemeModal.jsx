import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ThemePicker from './ThemePicker';
import { useTheme } from '../theme/ThemeProvider';

export default function ChangeThemeModal({ isOpen, onClose }) {
  const { profile, updateProfile } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(profile?.theme || 'sakura');
  const [saving, setSaving] = useState(false);

  // Sync selected theme when profile changes (e.g. initial load)
  useEffect(() => {
    if (profile?.theme) {
      setSelectedTheme(profile.theme);
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({ theme: selectedTheme });
      onClose();
    } catch (err) {
      console.error('Failed to update theme:', err);
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div className="reset-modal-overlay" style={{ background: 'none', backdropFilter: 'none', pointerEvents: 'none' }}>
        <div className="reset-modal-card" style={{ maxWidth: '480px', pointerEvents: 'auto', zIndex: 1000 }} onClick={(e) => e.stopPropagation()}>
        <h2 className="reset-modal-title display-font">Change theme</h2>
        
        <div style={{ marginBottom: '24px' }}>
          <ThemePicker 
            selectedTheme={selectedTheme} 
            onSelect={setSelectedTheme} 
          />
        </div>
        
        <div className="reset-modal-actions">
          <button 
            className="reset-modal-cancel" 
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            className="reset-modal-confirm" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save theme'}
          </button>
        </div>
      </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
