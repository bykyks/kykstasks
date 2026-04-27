import React, { useState } from 'react';
import { useStore } from '../../store';
import { TaskList } from '../tasks/TaskList';
import { isOverdue, isToday } from '../../lib/utils';
import type { Task } from '../../types';

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH_NAMES = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

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

        {/* Sort */}
        <div className="flex items-center gap-2 pb-0.5">
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

      {overdue.length > 0 && (
        <section className="mb-8">
          <SectionLabel color="#EF4444" label={`En retard · ${overdue.length}`} />
          <TaskList tasks={overdue} draggable={sort === 'default'} />
        </section>
      )}

      <section className="mb-8">
        <SectionLabel
          color="var(--accent)"
          label={`Aujourd'hui${today.length > 0 ? ` · ${today.length}` : ''}`}
        />
        <TaskList
          tasks={today}
          draggable={sort === 'default'}
          emptyMessage={overdue.length === 0 ? "Tout est à jour ! 🎉" : "Aucune tâche pour aujourd'hui"}
        />
      </section>

      {completed.length > 0 && (
        <section>
          <SectionLabel color="var(--text-muted)" label={`Terminées · ${completed.length}`} />
          <TaskList tasks={completed} draggable={false} />
        </section>
      )}
    </div>
  );
}
