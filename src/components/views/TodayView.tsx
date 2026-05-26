import React, { useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { useStore } from '../../store';
import { TaskList } from '../tasks/TaskList';
import { isOverdue, isToday } from '../../lib/utils';
import { sortTasks, type SortKey } from '../../lib/taskFilters';
import { cn } from '../../lib/utils';

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH_NAMES = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function SectionLabel({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-[10px]">
      <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color }}>{label}</span>
    </div>
  );
}

export function TodayView() {
  const tasks = useStore((s) => s.tasks);
  const [sort, setSort] = useState<SortKey>('default');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>(() =>
    (localStorage.getItem('view-mode-today') ?? 'list') as 'list' | 'cards',
  );

  const setViewModeAndPersist = (m: 'list' | 'cards') => {
    setViewMode(m);
    localStorage.setItem('view-mode-today', m);
  };

  const overdue = sortTasks(
    tasks.filter((t) => !t.completed && t.due_date && isOverdue(t.due_date) && !isToday(t.due_date)),
    sort,
  );
  const today = sortTasks(
    tasks.filter((t) => !t.completed && isToday(t.due_date)),
    sort,
  );
  const completed = tasks.filter(
    (t) => t.completed && (isToday(t.due_date) || isToday(t.completed_at)),
  );

  const now = new Date();
  const dayName = DAY_NAMES[now.getDay()];
  const dayNum = now.getDate();
  const monthName = MONTH_NAMES[now.getMonth()];

  const variant = viewMode === 'cards' ? 'card' : 'row';

  return (
    <div className="px-12 py-9">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-[30px] font-bold text-[var(--text-primary)] tracking-[-0.6px] leading-none">
            Aujourd'hui
          </h1>
          <p className="text-[14px] font-semibold text-[var(--accent)] mt-[5px]">
            {dayName} {dayNum} {monthName}
          </p>
        </div>

        <div className="flex items-center gap-3 pb-0.5">
          {/* View mode toggle */}
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

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[var(--text-muted)]">Trier par</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-[var(--bg)] border border-[var(--border)] rounded-[7px] px-2.5 py-1
                         text-[var(--text-secondary)] text-[12px] font-medium focus:outline-none
                         focus:border-[var(--accent)] cursor-pointer transition-colors"
            >
              <option value="default">Par défaut</option>
              <option value="priority">Priorité</option>
              <option value="date">Date</option>
              <option value="title">Titre</option>
            </select>
          </div>
        </div>
      </div>

      {overdue.length > 0 && (
        <section className="mb-8">
          <SectionLabel color="#EF4444" label={`En retard · ${overdue.length}`} />
          <TaskList tasks={overdue} draggable={sort === 'default'} variant={variant} />
        </section>
      )}

      <section className="mb-8">
        <SectionLabel
          color="var(--accent)"
          label={`À faire${today.length > 0 ? ` · ${today.length}` : ''}`}
        />
        <TaskList
          tasks={today}
          draggable={sort === 'default'}
          emptyMessage={overdue.length === 0 ? "Tout est à jour ! 🎉" : "Aucune tâche pour aujourd'hui"}
          variant={variant}
        />
      </section>

      {completed.length > 0 && (
        <section>
          <SectionLabel color="var(--text-muted)" label={`Terminées · ${completed.length}`} />
          <TaskList tasks={completed} draggable={false} variant={variant} />
        </section>
      )}
    </div>
  );
}
