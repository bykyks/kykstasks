import React from 'react';
import { useStore } from '../../store';
import { TaskList } from '../tasks/TaskList';
import { getIcon } from '../ui/IconPicker';

export function ProjectView({ id }: { id: string }) {
  const { tasks, projects } = useStore();
  const project = projects.find((p) => p.id === id);
  const projectTasks = tasks.filter((t) => !t.completed && t.project_id === id);
  const completedTasks = tasks.filter((t) => t.completed && t.project_id === id);

  if (!project) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${project.color}22`, color: project.color }}
        >
          {getIcon(project.icon, 20)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{project.name}</h1>
          <p className="text-sm text-[var(--text-muted)]">
            {projectTasks.length} active{projectTasks.length > 1 ? 's' : ''} · {completedTasks.length} terminée{completedTasks.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <TaskList tasks={projectTasks} emptyMessage="Aucune tâche active dans ce projet" />

      {completedTasks.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
            Terminées ({completedTasks.length})
          </h2>
          <TaskList tasks={completedTasks} draggable={false} />
        </div>
      )}
    </div>
  );
}
