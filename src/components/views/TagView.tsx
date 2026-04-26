import React from 'react';
import { Tag } from 'lucide-react';
import { useStore } from '../../store';
import { TaskList } from '../tasks/TaskList';

export function TagView({ id }: { id: string }) {
  const { tasks, tags } = useStore();
  const tag = tags.find((t) => t.id === id);
  const tagTasks = tasks.filter((t) => !t.completed && t.tags.includes(id));

  if (!tag) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Tag size={18} style={{ color: tag.color }} />
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{tag.name}</h1>
        <span className="text-sm text-[var(--text-muted)]">({tagTasks.length})</span>
      </div>
      <TaskList tasks={tagTasks} emptyMessage="Aucune tâche avec cette étiquette" />
    </div>
  );
}
