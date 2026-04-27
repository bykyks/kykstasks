import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { saveLocalBackup } from '../lib/export';

export function useAutoBackup() {
  const tasks = useStore((s) => s.tasks);
  const settings = useStore((s) => s.settings);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!settings?.backup_enabled) return;

    // Debounce: save 5s after last change
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveLocalBackup();
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tasks, settings?.backup_enabled]);
}
