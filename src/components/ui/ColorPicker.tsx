import React from 'react';
import { Check } from 'lucide-react';
import { PRESET_COLORS } from '../../types';
import { cn } from '../../lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            'w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center',
            value === c && 'ring-2 ring-offset-2 ring-[var(--accent)] ring-offset-[var(--surface)]',
          )}
          style={{ backgroundColor: c }}
        >
          {value === c && <Check size={12} color="white" strokeWidth={3} />}
        </button>
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded-full cursor-pointer border-2 border-[var(--border)]"
        title="Couleur personnalisée"
      />
    </div>
  );
}
