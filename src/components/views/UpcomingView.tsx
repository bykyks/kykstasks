import React from 'react';
import { addDays, format, startOfDay } from 'date-fns';
import { useStore } from '../../store';
import { TaskList } from '../tasks/TaskList';
import { formatDate } from '../../lib/utils';

export function UpcomingView() {
  const tasks = useStore((s) => s.tasks);
  const today = startOfDay(new Date());

  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const tasksByDay = days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return {
      date: day,
      dateStr,
      tasks: tasks.filter(
        (t) => !t.completed && t.due_date === dateStr,
      ),
    };
  });

  const noDate = tasks.filter((t) => !t.completed && !t.due_date);

  return (
    <div className="px-12 py-9 space-y-6">
      {tasksByDay.map(({ date, dateStr, tasks: dayTasks }) => (
        <section key={dateStr}>
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block" />
            {formatDate(dateStr)}
            <span className="normal-case font-normal ml-1 opacity-60">
              {format(date, 'EEEE')}
            </span>
            {dayTasks.length > 0 && (
              <span className="ml-auto font-normal normal-case">{dayTasks.length}</span>
            )}
          </h2>
          {dayTasks.length > 0 ? (
            <TaskList tasks={dayTasks} draggable={false} />
          ) : (
            <p className="text-sm text-[var(--text-muted)] pl-4">Aucune tâche</p>
          )}
        </section>
      ))}

      {noDate.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Sans date d'échéance ({noDate.length})
          </h2>
          <TaskList tasks={noDate} draggable={false} />
        </section>
      )}
    </div>
  );
}
