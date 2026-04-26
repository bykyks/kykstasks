import { useEffect } from 'react';
import { useStore } from '../store';

export function useKeyboardShortcuts() {
  const store = useStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const inInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Global shortcuts (always active)
      if (meta && e.key === 'k') {
        e.preventDefault();
        store.setShowQuickAdd(true);
        return;
      }

      if (e.key === 'Escape') {
        if (store.showTaskForm) { store.closeTaskForm(); return; }
        if (store.showQuickAdd) { store.setShowQuickAdd(false); return; }
        if (store.showSettings) { store.toggleSettings(); return; }
        if (store.selectedTaskId) { store.selectTask(null); return; }
      }

      if (inInput) return;

      // Navigation shortcuts
      if (e.key === '1') store.setView('today');
      if (e.key === '2') store.setView('upcoming');
      if (e.key === '3') store.setView('all');
      if (e.key === '4') store.setView('kanban');
      if (e.key === '/') {
        e.preventDefault();
        store.setView('search');
      }

      // Actions
      if (e.key === 'n' && !meta) {
        store.openTaskForm();
      }
      if (meta && e.key === ',') {
        e.preventDefault();
        store.toggleSettings();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedTaskId) {
          store.deleteTask(store.selectedTaskId);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);
}
