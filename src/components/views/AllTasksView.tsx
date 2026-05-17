import React, { useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { useStore } from '../../store';
import { TaskList } from '../tasks/TaskList';
import type { Priority, Task } from '../../types';
import { PRIORITY_CONFIG } from '../../types';
import { cn } from '../../lib/utils';

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

const SORT_LABELS: Record<SortKey, string> = {
  default: 'Par défaut',
  priority: 'Priorité',
  date: 'Date',
  title: 'Titre',
};

export function AllTasksView() {
  const tasks = useStore((s) => s.tasks);
  const [status, setStatus] = useState<'all' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
  const [sort, setSort] = useState<SortKey>('default');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>(() =>
    (localStorage.getItem('view-mode-all') ?? 'list') as 'list' | 'cards',
  );

  const setViewModeAndPersist = (m: 'list' | 'cards') => {
    setViewMode(m);
    localStorage.setItem('view-mode-all', m);
  };

  const filtered = sortTasks(
    tasks.filter((t) => {
      if (status === 'completed') return t.completed;
      return !t.completed && (priorityFilter === null || t.priority === priorityFilter);
    }),
    sort,
  );

  const variant = viewMode === 'cards' ? 'card' : 'row';

  return (
    <div className="px-12 py-7">
      {/* Top row: status tabs + view mode toggle */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1 bg-[var(--bg)] border border-[var(--border)] rounded-[9px] p-[3px]">
          {(['all', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                if (s === 'completed') setPriorityFilter(null);
              }}
              className={cn(
                'px-4 py-[4px] rounded-[7px] text-[12.5px] transition-colors',
                status === s
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]',
              )}
            >
              {s === 'all' ? 'Toutes' : 'Terminées'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-[3px] bg-[var(--bg)] border border-[var(--border)] rounded-[9px] p-[3px]">
          <button
            onClick={() => setViewModeAndPersist('list')}
            className={cn(
              'p-[5px] rounded-[6px] transition-colors',
              viewMode === 'list'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >
            <List size={13} />
          </button>
          <button
            onClick={() => setViewModeAndPersist('cards')}
            className={cn(
              'p-[5px] rounded-[6px] transition-colors',
              viewMode === 'cards'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >
            <LayoutGrid size={13} />
          </button>
        </div>
      </div>

      {/* Filter chips + sort */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {status === 'all' && (
          <>
            <button
              onClick={() => setPriorityFilter(null)}
              className={cn(
                'px-[11px] py-[4px] rounded-[7px] text-[12px] font-medium transition-colors border',
                priorityFilter === null
                  ? 'bg-[var(--surface-active)] border-[var(--accent)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]',
              )}
            >
              Toutes
            </button>
            {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([p, cfg]) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(priorityFilter === p ? null : p)}
                className={cn(
                  'flex items-center gap-1.5 px-[11px] py-[4px] rounded-[7px] text-[12px] font-medium transition-colors border',
                  priorityFilter === p
                    ? 'bg-[var(--surface-active)] border-[var(--accent)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]',
                )}
              >
                <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </button>
            ))}
            <div className="h-4 w-px bg-[var(--border)]" />
          </>
        )}

        <span className="text-[12px] text-[var(--text-muted)]">Trier</span>
        {(Object.keys(SORT_LABELS) as SortKey[]).map((sk) => (
          <button
            key={sk}
            onClick={() => setSort(sk)}
            className={cn(
              'px-[11px] py-[4px] rounded-[7px] text-[12px] font-medium transition-colors border',
              sort === sk
                ? 'bg-[var(--surface-active)] border-[var(--accent)] text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]',
            )}
          >
            {SORT_LABELS[sk]}
          </button>
        ))}
      </div>

      <TaskList
        tasks={filtered}
        draggable={status === 'all' && priorityFilter === null && sort === 'default'}
        emptyMessage={status === 'completed' ? 'Aucune tâche terminée' : 'Aucune tâche avec ce filtre'}
        variant={variant}
      />
    </div>
  );
}
