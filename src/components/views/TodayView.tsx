import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header style Taskly */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] tracking-tight leading-none">
            Aujourd'hui
          </h1>
          <p className="text-lg font-semibold text-[var(--accent)] mt-1">
            {dayName} {dayNum} {monthName}
          </p>
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-2 pb-1">
          <ArrowUpDown size={14} className="text-[var(--text-muted)]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-[var(--surface-hover)] border-2 border-[var(--border)] rounded-xl px-3 py-1.5
                       text-[var(--text-secondary)] text-sm font-medium focus:outline-none
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
          <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            En retard · {overdue.length}
          </h2>
          <TaskList tasks={overdue} draggable={sort === 'default'} />
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block" />
          Aujourd'hui {today.length > 0 && `· ${today.length}`}
        </h2>
        <TaskList
          tasks={today}
          draggable={sort === 'default'}
          emptyMessage={
            overdue.length === 0 ? "Tout est à jour ! 🎉" : "Aucune tâche pour aujourd'hui"
          }
        />
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            Terminées · {completed.length}
          </h2>
          <TaskList tasks={completed} draggable={false} />
        </section>
      )}
    </div>
  );
}
