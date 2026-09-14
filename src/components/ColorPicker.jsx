import { useState, useEffect } from 'react';

const COLORS = [
  { id: 'coral', hex: '#F4B8A8' },
  { id: 'lavender', hex: '#C9B8E8' },
  { id: 'sky', hex: '#A8C8E8' },
  { id: 'mint', hex: '#A8D8C8' },
  { id: 'sunset', hex: '#F4C8A0' },
  { id: 'sand', hex: '#E8D8C0' },
];

export default function ColorPicker({ selectedColor, onSelectColor }) {
  return (
    <div className="color-picker">
      {COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`color-dot ${selectedColor === c.id ? 'selected' : ''}`}
          style={{ backgroundColor: c.hex }}
          onClick={() => onSelectColor(c.id)}
          aria-label={`Select ${c.id} color`}
        />
      ))}
    </div>
  );
}

export { COLORS };
