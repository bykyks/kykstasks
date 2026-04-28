import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, Repeat, Trash2, Pencil } from 'lucide-react';
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
  variant?: 'row' | 'card';
  dimmed?: boolean;
}

export function TaskItem({ task, draggable = false, variant = 'row', dimmed = false }: TaskItemProps) {
  const { toggleTask, deleteTask, selectTask, selectedTaskId, openTaskForm, tags, updateTask } = useStore();
  const [completing, setCompleting] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
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
    transition: isDragging ? 'none' : transition,
  };

  const taskTags = tags.filter((t) => task.tags.includes(t.id));
  const doneSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (completing) return;
    setCompleting(true);
    await new Promise((r) => setTimeout(r, 200));
    await toggleTask(task.id);
    setCompleting(false);
  };

  const handleTitleSave = async () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== task.title) {
      await updateTask({ id: task.id, title: trimmed });
    } else {
      setTitleValue(task.title);
    }
    setEditingTitle(false);
  };

  if (isDragging) {
    if (variant === 'card') {
      return (
        <div
          ref={setNodeRef}
          style={{ ...style, borderLeftColor: priority.color }}
          className="rounded-[10px] border border-[var(--border)] border-l-[3px] bg-[var(--surface-active)]/40 py-3 px-3 min-h-[60px]"
        />
      );
    }
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border-b border-[var(--border)] py-[10px] min-h-[48px] opacity-40"
      />
    );
  }

  /* ── CARD variant (Kanban) ──────────────────────────────────────────────── */
  if (variant === 'card') {
    return (
      <motion.div
        ref={setNodeRef}
        {...(draggable ? { ...attributes, ...listeners } : {})}
        layout
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
        onClick={() => selectTask(isSelected ? null : task.id)}
        className={cn(
          'group flex items-start gap-3 px-3 py-3 rounded-[10px] select-none cursor-pointer',
          'bg-[var(--surface)] border border-[var(--border)] border-l-[3px]',
          'transition-all duration-150',
          draggable && 'task-draggable',
          isSelected
            ? 'ring-1 ring-[var(--accent)]/40'
            : 'hover:bg-[var(--surface-hover)]',
          (task.completed || dimmed) && 'opacity-60',
        )}
        style={{ ...style, borderLeftColor: priority.color }}
      >
        <motion.button
          onClick={handleComplete}
          animate={completing ? { scale: [1, 1.35, 0.85, 1] } : { scale: 1 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className={cn(
            'mt-0.5 shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors',
            'border-[1.5px]',
            task.completed
              ? 'bg-[var(--accent)] border-[var(--accent)]'
              : 'border-[var(--border)] hover:border-[var(--accent)]',
          )}
        >
          {task.completed && (
            <svg width="9" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-[13.5px] font-medium text-[var(--text-primary)] leading-snug',
            (task.completed || dimmed) && 'line-through text-[var(--text-muted)]',
          )}>
            {task.title}
          </p>
          {taskTags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {taskTags.map((tag) => (
                <Badge key={tag.id} label={tag.name} color={tag.color} />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); openTaskForm(task.id); }}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <span
            className="w-[7px] h-[7px] rounded-full shrink-0"
            style={{ backgroundColor: priority.color }}
          />
        </div>
      </motion.div>
    );
  }

  /* ── ROW variant (default — Today, Upcoming, AllTasks, Project) ─────────── */
  return (
    <motion.div
      ref={setNodeRef}
      {...(draggable ? { ...attributes, ...listeners } : {})}
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      onClick={() => !editingTitle && selectTask(isSelected ? null : task.id)}
      className={cn(
        'group flex items-center gap-3 py-[10px] select-none cursor-pointer',
        'transition-colors duration-150',
        draggable && 'task-draggable',
        isSelected
          ? 'bg-[var(--surface-active)]/50 rounded-lg px-2 -mx-2'
          : 'hover:bg-[var(--bg)] rounded-lg px-2 -mx-2',
        task.completed && 'opacity-[0.42]',
      )}
      style={style}
    >
      {/* Checkbox */}
      <motion.button
        onClick={handleComplete}
        animate={completing ? { scale: [1, 1.35, 0.85, 1] } : { scale: 1 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className={cn(
          'shrink-0 w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors',
          'border-[1.5px]',
          task.completed
            ? 'bg-[var(--accent)] border-[var(--accent)]'
            : 'border-[var(--border)] hover:border-[var(--accent)]',
        )}
      >
        {task.completed && (
          <svg width="9" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </motion.button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') {
                setTitleValue(task.title);
                setEditingTitle(false);
              }
            }}
            onBlur={handleTitleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-[14.5px] font-medium text-[var(--text-primary)] bg-transparent border-b border-[var(--accent)] focus:outline-none tracking-[-0.1px] leading-snug"
          />
        ) : (
          <p
            className={cn(
              'text-[14.5px] font-medium text-[var(--text-primary)] truncate leading-snug tracking-[-0.1px]',
              task.completed && 'line-through text-[var(--text-muted)]',
            )}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!task.completed) {
                setEditingTitle(true);
                setTitleValue(task.title);
              }
            }}
          >
            {task.title}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.due_date && (
            <span className={cn(
              'flex items-center gap-1 text-[11.5px] font-medium',
              overdue ? 'text-red-500' : 'text-[var(--text-muted)]',
            )}>
              <Calendar size={11} />
              {formatDate(task.due_date)}
              {task.due_time && ` · ${task.due_time}`}
            </span>
          )}
          {task.recurrence !== 'none' && (
            <span className="flex items-center gap-1 text-[11.5px] font-medium text-[var(--text-muted)]">
              <Repeat size={11} />
              {task.recurrence}
            </span>
          )}
          {taskTags.map((tag) => (
            <span
              key={tag.id}
              className="text-[11.5px] font-medium text-[var(--text-muted)] bg-[var(--tag-bg)] rounded px-[7px] py-[1px]"
            >
              {tag.name}
            </span>
          ))}
          {task.subtasks.length > 0 && (
            <span className="text-[11.5px] font-medium text-[var(--text-muted)]">
              {doneSubtasks}/{task.subtasks.length} sous-tâche{task.subtasks.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {task.subtasks.length > 0 && (
          <div className="mt-1.5 h-[3px] rounded-full bg-[var(--border)] overflow-hidden max-w-[120px]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(doneSubtasks / task.subtasks.length) * 100}%`,
                backgroundColor: 'var(--accent)',
              }}
            />
          </div>
        )}
      </div>

      {/* Right side: priority dot + hover actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); openTaskForm(task.id); }}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
        {task.due_time && !task.due_date && (
          <span className="text-[12px] font-medium text-[var(--text-muted)]">{task.due_time}</span>
        )}
        <span
          className="w-[7px] h-[7px] rounded-full shrink-0"
          style={{ backgroundColor: priority.color }}
        />
      </div>
    </motion.div>
  );
}
