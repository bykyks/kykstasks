import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../store';
import type { Subtask } from '../../types';

interface SubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
}

export function SubtaskList({ taskId, subtasks }: SubtaskListProps) {
  const { createSubtask, updateSubtask, deleteSubtask } = useStore();
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    const t = newTitle.trim();
    if (!t) return;
    await createSubtask(taskId, t);
    setNewTitle('');
  };

  const sorted = [...subtasks].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {sorted.map((sub) => (
          <motion.div
            key={sub.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="group flex items-center gap-2 py-1"
          >
            <button
              onClick={() => updateSubtask(sub.id, undefined, !sub.completed)}
              className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                sub.completed
                  ? 'bg-[var(--accent)] border-[var(--accent)]'
                  : 'border-[var(--border)] hover:border-[var(--accent)]'
              }`}
            >
              {sub.completed && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span
              className={`flex-1 text-sm ${
                sub.completed
                  ? 'line-through text-[var(--text-muted)]'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {sub.title}
            </span>
            <button
              onClick={() => deleteSubtask(sub.id, taskId)}
              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-500 text-[var(--text-muted)] transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {adding ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-[var(--border)] shrink-0" />
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') { setAdding(false); setNewTitle(''); }
            }}
            onBlur={() => { if (!newTitle.trim()) setAdding(false); else handleAdd(); }}
            placeholder="Ajouter une sous-tâche…"
            className="flex-1 text-sm bg-transparent border-b border-[var(--border)] pb-0.5
                       text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                       focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)]
                     transition-colors py-1"
        >
          <Plus size={14} />
          Ajouter une sous-tâche
        </button>
      )}
    </div>
  );
}
