import { useEffect } from 'react';
import { useStore } from '../store';
import type { Theme } from '../types';

export function useTheme() {
  const settings = useStore((s) => s.settings);
  const theme = settings?.theme ?? 'system';

  useEffect(() => {
    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle('dark', dark);
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches);
      const listener = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    } else {
      apply(theme === 'dark');
    }
  }, [theme]);
}
