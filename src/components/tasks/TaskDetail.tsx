import React from 'react';
import { X, Pencil, Trash2, Calendar, Tag, Repeat, Bell, FolderOpen } from 'lucide-react';
import { useStore } from '../../store';
import { PRIORITY_CONFIG } from '../../types';
import { SubtaskList } from './SubtaskList';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../lib/utils';

interface TaskDetailProps {
  taskId: string;
  onClose: () => void;
}

export function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const task = useStore((s) => s.tasks.find((t) => t.id === taskId));
  const { projects, tags, deleteTask, openTaskForm } = useStore();

  if (!task) return null;

  const priority = PRIORITY_CONFIG[task.priority];
  const project = projects.find((p) => p.id === task.project_id);
  const taskTags = tags.filter((t) => task.tags.includes(t.id));

  return (
    <div className="flex flex-col h-full bg-[var(--surface)]">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--border)]">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: priority.color }}
        />
        <h2 className="flex-1 text-sm font-semibold text-[var(--text-primary)] truncate">
          {task.title}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => openTaskForm(task.id)}>
          <Pencil size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { deleteTask(task.id); onClose(); }}
          className="hover:text-red-500"
        >
          <Trash2 size={14} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Priority */}
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
            Priorité
          </p>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${priority.bg}`}
            style={{ color: priority.color }}
          >
            {priority.label}
          </span>
        </div>

        {/* Due date */}
        {task.due_date && (
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Échéance
            </p>
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
              <Calendar size={13} />
              {formatDate(task.due_date)}
              {task.due_time && ` à ${task.due_time}`}
            </span>
          </div>
        )}

        {/* Reminder */}
        {task.reminder_minutes != null && (
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Rappel
            </p>
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
              <Bell size={13} />
              {task.reminder_minutes < 60
                ? `${task.reminder_minutes} min avant`
                : task.reminder_minutes === 60
                ? '1 heure avant'
                : `${task.reminder_minutes / 60} heures avant`}
            </span>
          </div>
        )}

        {/* Recurrence */}
        {task.recurrence !== 'none' && (
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Récurrence
            </p>
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
              <Repeat size={13} />
              {task.recurrence === 'daily' ? 'Quotidien' : task.recurrence === 'weekly' ? 'Hebdomadaire' : 'Mensuel'}
              {task.recurrence_end && ` jusqu'au ${formatDate(task.recurrence_end)}`}
            </span>
          </div>
        )}

        {/* Project */}
        {project && (
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Projet
            </p>
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
              <FolderOpen size={13} style={{ color: project.color }} />
              {project.name}
            </span>
          </div>
        )}

        {/* Tags */}
        {taskTags.length > 0 && (
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Étiquettes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {taskTags.map((tag) => (
                <Badge key={tag.id} label={tag.name} color={tag.color} />
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {task.notes && task.notes !== '<p></p>' && (
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Notes
            </p>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-primary)]"
              dangerouslySetInnerHTML={{ __html: task.notes }}
            />
          </div>
        )}

        {/* Subtasks */}
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
            Sous-tâches {task.subtasks.length > 0 && `(${task.subtasks.filter((s) => s.completed).length}/${task.subtasks.length})`}
          </p>
          <SubtaskList taskId={task.id} subtasks={task.subtasks} />
        </div>

        {/* Meta */}
        <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
          <p>Créée le {new Date(task.created_at).toLocaleDateString('fr-FR')}</p>
          <p>Modifiée le {new Date(task.updated_at).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
}
