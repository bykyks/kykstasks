import React, { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import { TaskItem } from './TaskItem';
import { useStore } from '../../store';
import type { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
  draggable?: boolean;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  draggable = true,
  emptyMessage = 'Aucune tâche',
}: TaskListProps) {
  const reorderTasks = useStore((s) => s.reorderTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...tasks];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    reorderTasks(newOrder.map((t) => t.id));
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
        <div className="text-4xl mb-3">✓</div>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  if (!draggable) {
    return (
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} draggable={false} />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} draggable />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeTask && (
          <div className="drag-overlay">
            <TaskItem task={activeTask} draggable={false} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
