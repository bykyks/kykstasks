import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Folder } from 'lucide-react';
import { useStore } from '../../store';
import type { Priority } from '../../types';
import { PRIORITY_CONFIG } from '../../types';
import { cn, formatDate } from '../../lib/utils';

interface QuickTaskFormProps {
  onClose: () => void;
}

export function QuickTaskForm({ onClose }: QuickTaskFormProps) {
  const { projects, createTask } = useStore();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [openPicker, setOpenPicker] = useState<'date' | 'priority' | 'project' | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const priorityConfig = PRIORITY_CONFIG[priority];
  const selectedProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;
    await createTask({
      title: title.trim(),
      notes,
      priority,
      project_id: projectId,
      tags: [],
      due_date: dueDate,
      due_time: null,
      recurrence: 'none',
      recurrence_end: null,
      kanban_status: 'todo',
      reminder_minutes: null,
    });
    onClose();
  };

  const closePicker = () => setOpenPicker(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/25" onClick={onClose} />

      {/* Picker backdrop - closes any open picker */}
      {openPicker && (
        <div className="fixed inset-0 z-[55]" onClick={closePicker} />
      )}

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-50 w-full sm:max-w-[520px] bg-[var(--surface)] rounded-t-[20px] sm:rounded-[16px] shadow-2xl border border-[var(--border)] overflow-visible"
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-[var(--border)]" />
        </div>

        {/* Title + notes */}
        <div className="px-5 pt-4 sm:pt-5 pb-3">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
            }}
            placeholder="Nouvelle tâche…"
            className="w-full text-[18px] font-semibold bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none tracking-[-0.3px]"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Description (optionnel)"
            className="w-full mt-2 text-[13.5px] bg-transparent text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
        </div>

        {/* Chips row */}
        <div className="flex items-center gap-2 px-5 pb-4 flex-wrap">
          {/* Date chip */}
          <div className="relative z-[60]">
            <button
              type="button"
              onClick={() => setOpenPicker(openPicker === 'date' ? null : 'date')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-[5px] rounded-[8px] text-[12px] font-medium border transition-colors',
                dueDate
                  ? 'border-[var(--accent)]/40 bg-[var(--surface-active)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text-secondary)]',
              )}
            >
              <Calendar size={12} />
              {dueDate ? formatDate(dueDate) : 'Date'}
            </button>
            {openPicker === 'date' && (
              <div className="absolute left-0 bottom-full mb-1.5 sm:bottom-auto sm:top-full sm:mb-0 sm:mt-1.5 z-[70] bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-xl p-3 min-w-[200px]">
                <input
                  type="date"
                  value={dueDate ?? ''}
                  onChange={(e) => { setDueDate(e.target.value || null); closePicker(); }}
                  autoFocus
                  className="w-full text-[12.5px] bg-[var(--surface-hover)] border border-[var(--border)] rounded-[8px] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => { setDueDate(null); closePicker(); }}
                    className="mt-1.5 w-full text-[11.5px] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 py-1.5 rounded-[7px] transition-colors"
                  >
                    Effacer la date
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Priority chip */}
          <div className="relative z-[60]">
            <button
              type="button"
              onClick={() => setOpenPicker(openPicker === 'priority' ? null : 'priority')}
              className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-[8px] text-[12px] font-medium border transition-colors"
              style={{
                borderColor: `${priorityConfig.color}66`,
                backgroundColor: priorityConfig.bgColor,
                color: priorityConfig.color,
              }}
            >
              <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: priorityConfig.color }} />
              {priorityConfig.label}
              <ChevronDown size={10} className="opacity-60" />
            </button>
            {openPicker === 'priority' && (
              <div className="absolute left-0 bottom-full mb-1.5 sm:bottom-auto sm:top-full sm:mb-0 sm:mt-1.5 z-[70] bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-xl p-1.5 min-w-[140px]">
                {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([p, cfg]) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setPriority(p); closePicker(); }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[12.5px] font-medium transition-colors',
                      priority === p ? 'bg-[var(--surface-active)]' : 'hover:bg-[var(--surface-hover)]',
                    )}
                  >
                    <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                    <span style={{ color: cfg.color }}>{cfg.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project chip */}
          <div className="relative z-[60]">
            <button
              type="button"
              onClick={() => setOpenPicker(openPicker === 'project' ? null : 'project')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-[5px] rounded-[8px] text-[12px] font-medium border transition-colors',
                projectId
                  ? 'border-[var(--accent)]/40 bg-[var(--surface-active)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text-secondary)]',
              )}
            >
              <Folder size={12} />
              {selectedProject?.name ?? 'Projet'}
            </button>
            {openPicker === 'project' && (
              <div className="absolute left-0 bottom-full mb-1.5 sm:bottom-auto sm:top-full sm:mb-0 sm:mt-1.5 z-[70] bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-xl p-1.5 min-w-[170px] max-h-[200px] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setProjectId(null); closePicker(); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[12.5px] font-medium transition-colors',
                    !projectId ? 'bg-[var(--surface-active)]' : 'hover:bg-[var(--surface-hover)]',
                  )}
                >
                  <span className="text-[var(--text-muted)]">Aucun projet</span>
                </button>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setProjectId(p.id); closePicker(); }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[12.5px] font-medium transition-colors',
                      projectId === p.id ? 'bg-[var(--surface-active)]' : 'hover:bg-[var(--surface-hover)]',
                    )}
                  >
                    <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-[var(--text-primary)]">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-3 pb-6 sm:pb-3 border-t border-[var(--border)]">
          <span className="flex-1 text-[12px] text-[var(--text-muted)] truncate">
            {selectedProject ? selectedProject.name : 'Inbox'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-1.5 rounded-[8px] text-[13px] font-semibold transition-all disabled:opacity-40"
            style={{
              backgroundColor: priorityConfig.bgColor,
              color: priorityConfig.color,
              border: `1.5px solid ${priorityConfig.color}88`,
            }}
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
}
