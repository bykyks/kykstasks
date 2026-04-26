import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
  onRemove?: () => void;
}

export function Badge({ label, color, className, onRemove }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        className,
      )}
      style={
        color
          ? { backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }
          : {}
      }
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity leading-none"
        >
          ×
        </button>
      )}
    </span>
  );
}
