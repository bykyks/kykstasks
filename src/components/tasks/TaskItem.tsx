import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, Repeat, Trash2, Pencil } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../../store';
import type { Task, Priority } from '../../types';
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
  const projects = useStore((s) => s.projects);
  const [completing, setCompleting] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [openBadge, setOpenBadge] = useState<'priority' | 'date' | null>(null);
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
  const project = projects.find((p) => p.id === task.project_id);
  const doneSubtasks = task.subtasks.filter((s) => s.completed).length;
  const isSoon = task.due_date && !overdue && !task.completed && (() => {
    const diff = new Date(task.due_date + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0);
    return diff >= 0 && diff <= 86400000;
  })();

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

  /* ── ROW variant ─────────────────────────────────────────────────────────── */
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
              overdue ? 'text-red-500' : isSoon ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]',
            )}>
              <Calendar size={11} />
              {formatDate(task.due_date)}
              {task.due_time && ` · ${task.due_time}`}
            </span>
          )}
          {project && (
            <span className="flex items-center gap-1 text-[11.5px] font-medium text-[var(--text-muted)]">
              <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ backgroundColor: project.color }} />
              {project.name}
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

      {/* Right side: inline badges (hover) + priority dot */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Backdrop to close open badge on outside click */}
        {openBadge && (
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenBadge(null); }} />
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Date badge */}
          {!task.completed && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenBadge(openBadge === 'date' ? null : 'date'); }}
                className={cn(
                  'flex items-center gap-[5px] px-2 py-[3px] rounded-[6px] text-[11px] font-medium border transition-colors',
                  task.due_date
                    ? overdue
                      ? 'text-red-500 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20'
                      : 'text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]/50'
                    : 'text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent)]/50',
                )}
              >
                <Calendar size={10} />
                {task.due_date ? formatDate(task.due_date) : 'Date'}
              </button>
              {openBadge === 'date' && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] shadow-lg p-3 min-w-[180px]">
                  <input
                    type="date"
                    defaultValue={task.due_date ?? ''}
                    onChange={(e) => {
                      updateTask({ id: task.id, due_date: e.target.value || null });
                      setOpenBadge(null);
                    }}
                    autoFocus
                    className="w-full text-[12px] bg-[var(--surface-hover)] border border-[var(--border)] rounded-[7px] px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  {task.due_date && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateTask({ id: task.id, due_date: null }); setOpenBadge(null); }}
                      className="mt-1.5 w-full text-[11.5px] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 py-1 rounded-[7px] transition-colors"
                    >
                      Effacer la date
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Priority badge */}
          {!task.completed && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenBadge(openBadge === 'priority' ? null : 'priority'); }}
                className="flex items-center gap-[5px] px-2 py-[3px] rounded-[6px] text-[11px] font-medium border border-transparent hover:border-[var(--border)] transition-colors"
                style={{ color: priority.color }}
              >
                <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: priority.color }} />
                {priority.label}
              </button>
              {openBadge === 'priority' && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] shadow-lg p-1.5 min-w-[130px]">
                  {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([p, cfg]) => (
                    <button
                      key={p}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTask({ id: task.id, priority: p });
                        setOpenBadge(null);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 px-2.5 py-[7px] rounded-[7px] text-[12px] font-medium transition-colors text-left',
                        task.priority === p ? 'bg-[var(--surface-active)]' : 'hover:bg-[var(--surface-hover)]',
                      )}
                    >
                      <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                      <span style={{ color: cfg.color }}>{cfg.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pencil */}
          <button
            onClick={(e) => { e.stopPropagation(); openTaskForm(task.id); }}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-active)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Pencil size={13} />
          </button>
          {/* Trash */}
          <button
            onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Priority dot — hidden on hover */}
        <span
          className="w-[7px] h-[7px] rounded-full shrink-0 group-hover:opacity-0 transition-opacity"
          style={{ backgroundColor: priority.color }}
        />
      </div>
    </motion.div>
  );
}
