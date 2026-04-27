import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useStore } from '../../store';
import { TaskList } from '../tasks/TaskList';
import type { Priority, Task } from '../../types';
import { PRIORITY_CONFIG } from '../../types';

type Filter = 'all' | Priority | 'completed';
type SortKey = 'default' | 'priority' | 'date' | 'title';

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

function sortTasks(tasks: Task[], sort: SortKey): Task[] {
  if (sort === 'priority')
    return [...tasks].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9));
  if (sort === 'date')
    return [...tasks].sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });
  if (sort === 'title')
    return [...tasks].sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  return tasks;
}

export function AllTasksView() {
  const tasks = useStore((s) => s.tasks);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>('default');

  const filtered = sortTasks(
    tasks.filter((t) => {
      if (filter === 'all') return !t.completed;
      if (filter === 'completed') return t.completed;
      return !t.completed && t.priority === filter;
    }),
    sort,
  );

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
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Filter + Sort bar */}
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

        <div className="ml-auto flex items-center gap-1.5">
          <ArrowUpDown size={12} className="text-[var(--text-muted)]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg px-2 py-1
                       text-[var(--text-secondary)] text-xs focus:outline-none focus:ring-1
                       focus:ring-[var(--accent)] cursor-pointer"
          >
            <option value="default">Par défaut</option>
            <option value="priority">Priorité</option>
            <option value="date">Date</option>
            <option value="title">Titre</option>
          </select>
        </div>
      </div>

      <TaskList
        tasks={filtered}
        draggable={filter === 'all' && sort === 'default'}
        emptyMessage={filter === 'completed' ? 'Aucune tâche terminée' : 'Aucune tâche avec ce filtre'}
      />
    </div>
  );
}
