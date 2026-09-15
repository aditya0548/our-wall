import { themes } from '../theme/themes';
import '../styles/setup.css';

export default function ThemePicker({ selectedTheme, onSelect }) {
  return (
    <div className="theme-picker">
      {Object.entries(themes).map(([id, theme]) => {
        const isSelected = selectedTheme === id;
        
        return (
          <button
            key={id}
            type="button"
            className={`theme-tile ${isSelected ? 'selected' : ''}`}
            data-preview-theme={id}
            onClick={() => onSelect(id)}
          >
            <div className="theme-tile-preview">
              <div className="fake-note">
                hi ♥
              </div>
              <div className="fake-btn">Send</div>
            </div>
            <div className="theme-tile-label">
              {theme.emoji} {theme.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
