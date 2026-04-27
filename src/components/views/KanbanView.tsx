import React, { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useStore } from '../../store';
import type { KanbanStatus, Task } from '../../types';
import { TaskItem } from '../tasks/TaskItem';
import { Plus } from 'lucide-react';

const COLUMNS: { id: KanbanStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'À faire', color: '#6366f1' },
  { id: 'in_progress', label: 'En cours', color: '#f97316' },
  { id: 'done', label: 'Terminé', color: '#22c55e' },
];

function KanbanColumn({
  column,
  tasks,
}: {
  column: (typeof COLUMNS)[0];
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const { openTaskForm } = useStore();

  return (
    <div className="flex flex-col min-h-0 w-80 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {column.label}
        </h3>
        <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-hover)] rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
        <button
          onClick={() => openTaskForm()}
          className="ml-auto p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 transition-colors min-h-[120px] ${
          isOver ? 'bg-[var(--accent)]/8 ring-2 ring-[var(--accent)]/30' : 'bg-[var(--surface-hover)]'
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} draggable />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center py-6 text-xs text-[var(--text-muted)]">
            Déposez les tâches ici
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanView() {
  const { tasks, updateTask } = useStore();
  const activeTasks = tasks.filter((t) => !t.completed);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const columnTasks = (col: KanbanStatus) =>
    activeTasks.filter((t) => t.kanban_status === col);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const overId = String(over.id);

    if (COLUMNS.some((c) => c.id === overId)) {
      await updateTask({ id: taskId, kanban_status: overId as KanbanStatus });
      return;
    }

    const overTask = tasks.find((t) => t.id === overId);
    const dragTask = tasks.find((t) => t.id === taskId);
    if (overTask && dragTask && overTask.kanban_status !== dragTask.kanban_status) {
      await updateTask({ id: taskId, kanban_status: overTask.kanban_status });
    }
  };

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 p-6 h-full min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={columnTasks(col.id)}
            />
          ))}
          <DragOverlay dropAnimation={null}>
            {activeTask && (
              <div className="drag-overlay">
                <TaskItem task={activeTask} draggable={false} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
