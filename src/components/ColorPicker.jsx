import { NOTE_COLORS } from '../constants/noteColors';

const COLOR_IDS = ['coral', 'lavender', 'sky', 'mint', 'sunset', 'sand'];

export default function ColorPicker({ selectedColor, onSelectColor }) {
  const palette = NOTE_COLORS;

  return (
    <div className="color-picker">
      {COLOR_IDS.map((id) => (
        <button
          key={id}
          type="button"
          className={`color-dot ${selectedColor === id ? 'selected' : ''}`}
          style={{ backgroundColor: palette[id] }}
          onClick={() => onSelectColor(id)}
          aria-label={`Select ${id} color`}
        />
      ))}
    </div>
  );
}

export { COLOR_IDS };
