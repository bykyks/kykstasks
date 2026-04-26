import React from 'react';
import {
  Folder, Briefcase, Home, Star, Heart, Zap, Book,
  Code, Music, Camera, Coffee, Globe, ShoppingCart,
  Target, TrendingUp, Users, Calendar, Flag,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PROJECT_ICONS } from '../../types';

const ICON_MAP: Record<string, React.ElementType> = {
  folder: Folder, briefcase: Briefcase, home: Home, star: Star,
  heart: Heart, zap: Zap, book: Book, code: Code, music: Music,
  camera: Camera, coffee: Coffee, globe: Globe, 'shopping-cart': ShoppingCart,
  target: Target, 'trending-up': TrendingUp, users: Users,
  calendar: Calendar, flag: Flag,
};

export function getIcon(name: string, size = 16): React.ReactNode {
  const Icon = ICON_MAP[name] ?? Folder;
  return <Icon size={size} />;
}

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PROJECT_ICONS.map((icon) => {
        const Icon = ICON_MAP[icon] ?? Folder;
        return (
          <button
            key={icon}
            type="button"
            onClick={() => onChange(icon)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              value === icon
                ? 'bg-[var(--accent)] text-white'
                : 'hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]',
            )}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
