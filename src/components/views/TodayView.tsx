import React from 'react';
import { useStore } from '../../store';
import { TaskList } from '../tasks/TaskList';
import { isOverdue, isToday } from '../../lib/utils';

export function TodayView() {
  const tasks = useStore((s) => s.tasks);

  const overdue = tasks.filter(
    (t) => !t.completed && t.due_date && isOverdue(t.due_date) && !isToday(t.due_date),
  );
  const today = tasks.filter(
    (t) => !t.completed && isToday(t.due_date),
  );
  const completed = tasks.filter(
    (t) => t.completed && (isToday(t.due_date) || isToday(t.completed_at)),
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      {overdue.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            En retard ({overdue.length})
          </h2>
          <TaskList tasks={overdue} />
        </section>
      )}

      <section className="mb-6">
        <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block" />
          Aujourd'hui {today.length > 0 && `(${today.length})`}
        </h2>
        <TaskList
          tasks={today}
          emptyMessage={
            overdue.length === 0 ? "Tout est à jour ! 🎉" : "Aucune tâche pour aujourd'hui"
          }
        />
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Terminées aujourd'hui ({completed.length})
          </h2>
          <TaskList tasks={completed} draggable={false} />
        </section>
      )}
    </div>
  );
}
