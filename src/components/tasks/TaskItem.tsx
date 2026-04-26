import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, Repeat, ChevronRight, Trash2, Pencil } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../../store';
import type { Task } from '../../types';
import { PRIORITY_CONFIG } from '../../types';
import { Badge } from '../ui/Badge';
import { cn, formatDate, isOverdue } from '../../lib/utils';

interface TaskItemProps {
  task: Task;
  draggable?: boolean;
}

export function TaskItem({ task, draggable = false }: TaskItemProps) {
  const { toggleTask, deleteTask, selectTask, selectedTaskId, openTaskForm, tags } = useStore();
  const [completing, setCompleting] = useState(false);
  const isSelected = selectedTaskId === task.id;
  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due_date) && !task.completed;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !draggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskTags = tags.filter((t) => task.tags.includes(t.id));
  const doneSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleting(true);
    await toggleTask(task.id);
    setCompleting(false);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...(draggable ? { ...attributes, ...listeners } : {})}
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      onClick={() => selectTask(isSelected ? null : task.id)}
      className={cn(
        'group flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer select-none',
        'border transition-all duration-150',
        isSelected
          ? 'bg-[var(--accent)]/8 border-[var(--accent)]/30'
          : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent)]/20 hover:bg-[var(--surface-hover)]',
        task.completed && 'opacity-50',
        `border-l-[3px]`,
      )}
      style={{
        ...style,
        borderLeftColor: priority.color,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={handleComplete}
        className={cn(
          'mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
          completing && 'animate-check-bounce',
          task.completed
            ? 'bg-[var(--accent)] border-[var(--accent)]'
            : 'border-[var(--border)] hover:border-[var(--accent)]',
        )}
      >
        {task.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium text-[var(--text-primary)] truncate',
            task.completed && 'line-through text-[var(--text-muted)]',
          )}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.due_date && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                overdue ? 'text-red-500 font-medium' : 'text-[var(--text-muted)]',
              )}
            >
              <Calendar size={11} />
              {formatDate(task.due_date)}
              {task.due_time && ` ${task.due_time}`}
            </span>
          )}
          {task.recurrence !== 'none' && (
            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Repeat size={11} />
              {task.recurrence}
            </span>
          )}
          {taskTags.map((tag) => (
            <Badge key={tag.id} label={tag.name} color={tag.color} />
          ))}
          {task.subtasks.length > 0 && (
            <span className="text-xs text-[var(--text-muted)]">
              {doneSubtasks}/{task.subtasks.length} sous-tâche{task.subtasks.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); openTaskForm(task.id); }}
          className="p-1.5 rounded-lg hover:bg-[var(--surface-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500"
        >
          <Trash2 size={13} />
        </button>
        <ChevronRight size={14} className="text-[var(--text-muted)] ml-0.5" />
      </div>
    </motion.div>
  );
}
