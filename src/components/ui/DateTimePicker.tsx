import React from 'react';
import { Calendar, Clock, X } from 'lucide-react';

interface DateTimePickerProps {
  date: string | null;
  time: string | null;
  onDateChange: (v: string | null) => void;
  onTimeChange: (v: string | null) => void;
}

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative flex items-center">
        <Calendar
          size={14}
          className="absolute left-2.5 text-[var(--text-muted)] pointer-events-none"
        />
        <input
          type="date"
          value={date ?? ''}
          onChange={(e) => onDateChange(e.target.value || null)}
          className="pl-8 pr-2 py-1.5 text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                     rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2
                     focus:ring-[var(--accent)] cursor-pointer"
        />
        {date && (
          <button
            type="button"
            onClick={() => { onDateChange(null); onTimeChange(null); }}
            className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={12} />
          </button>
        )}
      </div>
      {date && (
        <div className="relative flex items-center">
          <Clock
            size={14}
            className="absolute left-2.5 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            type="time"
            value={time ?? ''}
            onChange={(e) => onTimeChange(e.target.value || null)}
            className="pl-8 pr-2 py-1.5 text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                       rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2
                       focus:ring-[var(--accent)] cursor-pointer"
          />
          {time && (
            <button
              type="button"
              onClick={() => onTimeChange(null)}
              className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
