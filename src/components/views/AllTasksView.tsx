import React, { useState } from 'react';
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

  const sortKeys: SortKey[] = ['default', 'priority', 'date', 'title'];
  const sortLabels: Record<SortKey, string> = {
    default: 'Par défaut',
    priority: 'Priorité',
    date: 'Date',
    title: 'Titre',
  };

  return (
    <div className="max-w-[680px] mx-auto px-12 py-7">
      {/* Sort chips */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-[12px] text-[var(--text-muted)]">Trier par</span>
        {sortKeys.map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-[11px] py-[4px] rounded-[7px] text-[12px] font-medium transition-colors border ${
              sort === s
                ? 'bg-[var(--surface-active)] border-[var(--accent)] text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border)]'
            }`}
          >
            {sortLabels[s]}
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 bg-[var(--bg)] border border-[var(--border)] rounded-[9px] p-[3px] w-fit">
        {(['all', 'urgent', 'high', 'medium', 'low', 'completed'] as Filter[]).map((f) => {
          const isActive = filter === f;
          const label =
            f === 'all' ? 'Actives' :
            f === 'completed' ? 'Terminées' :
            PRIORITY_CONFIG[f as Priority].label;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-[4px] rounded-[7px] text-[12.5px] transition-colors ${
                isActive
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <TaskList
        tasks={filtered}
        draggable={filter === 'all' && sort === 'default'}
        emptyMessage={filter === 'completed' ? 'Aucune tâche terminée' : 'Aucune tâche avec ce filtre'}
      />
    </div>
  );
}
