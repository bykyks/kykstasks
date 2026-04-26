import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useStore } from '../../store';
import { Button } from './Button';

export function QuickAdd() {
  const showQuickAdd = useStore((s) => s.showQuickAdd);
  const setShowQuickAdd = useStore((s) => s.setShowQuickAdd);
  const createTask = useStore((s) => s.createTask);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showQuickAdd) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTitle('');
    }
  }, [showQuickAdd]);

  const submit = async () => {
    const t = title.trim();
    if (!t) return;
    await createTask({ title: t });
    setShowQuickAdd(false);
  };

  return (
    <AnimatePresence>
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-4">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickAdd(false)}
          />
          <motion.div
            className="relative w-full max-w-lg bg-[var(--surface)] rounded-2xl shadow-2xl
                        border border-[var(--border)] overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Zap size={18} className="text-[var(--accent)] shrink-0" />
              <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                  if (e.key === 'Escape') setShowQuickAdd(false);
                }}
                placeholder="Que faut-il faire ? (Entrée pour enregistrer)"
                className="flex-1 bg-transparent text-base text-[var(--text-primary)]
                           placeholder:text-[var(--text-muted)] focus:outline-none"
              />
              <Button variant="primary" size="sm" onClick={submit} disabled={!title.trim()}>
                Ajouter
              </Button>
            </div>
            <div className="px-4 pb-3 text-xs text-[var(--text-muted)]">
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-hover)] font-mono">Entrée</kbd> pour enregistrer ·{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-hover)] font-mono">Échap</kbd> pour annuler ·{' '}
              Pour plus de détails :{' '}
              <button
                className="underline hover:text-[var(--text-primary)]"
                onClick={() => { setShowQuickAdd(false); useStore.getState().openTaskForm(); }}
              >
                Nouvelle tâche
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
