import React, { useState } from 'react';
import { useStore } from '../../store';
import { TaskList } from '../tasks/TaskList';
import type { Priority } from '../../types';
import { PRIORITY_CONFIG } from '../../types';

type Filter = 'all' | Priority | 'completed';

export function AllTasksView() {
  const tasks = useStore((s) => s.tasks);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = tasks.filter((t) => {
    if (filter === 'all') return !t.completed;
    if (filter === 'completed') return t.completed;
    return !t.completed && t.priority === filter;
  });

  const filters: { key: Filter; label: string; color?: string }[] = [
    { key: 'all', label: 'Actives' },
    ...Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({
      key: k as Priority,
      label: v.label,
      color: v.color,
    })),
    { key: 'completed', label: 'Terminées' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      {/* Filter bar */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              filter === f.key
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40'
            }`}
            style={filter === f.key && f.color ? { backgroundColor: f.color, borderColor: f.color } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      <TaskList
        tasks={filtered}
        draggable={filter === 'all'}
        emptyMessage={filter === 'completed' ? 'Aucune tâche terminée' : 'Aucune tâche avec ce filtre'}
      />
    </div>
  );
}
