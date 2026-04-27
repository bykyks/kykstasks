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
  { id: 'todo',        label: 'À faire',  color: '#4F6EF7' },
  { id: 'in_progress', label: 'En cours', color: '#F97316' },
  { id: 'done',        label: 'Terminé',  color: '#22C55E' },
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
  const isDone = column.id === 'done';

  return (
    <div className="flex flex-col min-h-0 w-[300px] shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: column.color }}
        />
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)] tracking-[-0.1px]">
          {column.label}
        </h3>
        <span className="text-[11.5px] text-[var(--text-muted)] bg-[var(--tag-bg)] rounded-full px-[7px] py-px font-semibold">
          {tasks.length}
        </span>
        <button
          onClick={() => openTaskForm()}
          className="ml-auto w-[22px] h-[22px] rounded-[6px] border border-[var(--border)] flex items-center justify-center
                     hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Column body */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2.5 flex flex-col gap-2 min-h-[120px] transition-colors ${
          isOver
            ? 'bg-[var(--accent)]/8 ring-1 ring-[var(--accent)]/30'
            : 'bg-[var(--bg)]'
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              draggable
              variant="card"
              dimmed={isDone}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-6 text-[12px] text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-[10px]">
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
                <TaskItem task={activeTask} draggable={false} variant="card" />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
