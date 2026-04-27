import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../../store';
import type { Subtask } from '../../types';
import { cn } from '../../lib/utils';

interface SortableSubtaskProps {
  sub: Subtask;
  onToggle: () => void;
  onDelete: () => void;
}

function SortableSubtask({ sub, onToggle, onDelete }: SortableSubtaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sub.id });

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: isDragging ? 0.5 : 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="group flex items-center gap-2 py-1"
    >
      <button
        {...attributes}
        {...listeners}
        className="p-0.5 cursor-grab text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        tabIndex={-1}
      >
        <GripVertical size={12} />
      </button>
      <button
        onClick={onToggle}
        className={cn(
          'shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
          sub.completed
            ? 'bg-[var(--accent)] border-[var(--accent)]'
            : 'border-[var(--border)] hover:border-[var(--accent)]',
        )}
      >
        {sub.completed && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span
        className={cn(
          'flex-1 text-sm',
          sub.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]',
        )}
      >
        {sub.title}
      </span>
      <button
        onClick={onDelete}
        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:text-red-500 text-[var(--text-muted)] transition-opacity shrink-0"
      >
        <Trash2 size={12} />
      </button>
    </motion.div>
  );
}

interface SubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
}

export function SubtaskList({ taskId, subtasks }: SubtaskListProps) {
  const { createSubtask, updateSubtask, deleteSubtask, reorderSubtasks } = useStore();
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleAdd = async () => {
    const t = newTitle.trim();
    if (!t) return;
    await createSubtask(taskId, t);
    setNewTitle('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sorted = [...subtasks].sort((a, b) => a.position - b.position);
    const oldIndex = sorted.findIndex((s) => s.id === active.id);
    const newIndex = sorted.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...sorted];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    reorderSubtasks(taskId, newOrder.map((s) => s.id));
  };

  const sorted = [...subtasks].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sorted.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {sorted.map((sub) => (
              <SortableSubtask
                key={sub.id}
                sub={sub}
                onToggle={() => updateSubtask(sub.id, undefined, !sub.completed)}
                onDelete={() => deleteSubtask(sub.id, taskId)}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {adding ? (
        <div className="flex items-center gap-2 pl-5">
          <div className="shrink-0 w-4 h-4 rounded border-2 border-[var(--border)]" />
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') { setAdding(false); setNewTitle(''); }
            }}
            onBlur={() => { if (!newTitle.trim()) setAdding(false); else handleAdd(); }}
            placeholder="Ajouter une sous-tâche…"
            className="flex-1 text-sm bg-transparent border-b border-[var(--border)] pb-0.5
                       text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                       focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)]
                     transition-colors py-1 pl-5"
        >
          <Plus size={14} />
          Ajouter une sous-tâche
        </button>
      )}
    </div>
  );
}
