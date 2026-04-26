import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { RichTextEditor } from '../ui/RichTextEditor';
import { DateTimePicker } from '../ui/DateTimePicker';
import { Badge } from '../ui/Badge';
import { useStore } from '../../store';
import type { Priority, RecurrenceType, KanbanStatus } from '../../types';
import { PRIORITY_CONFIG } from '../../types';

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'Sans répétition' },
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
];

const REMINDER_OPTIONS = [
  { value: null, label: 'Aucun' },
  { value: 5, label: '5 min avant' },
  { value: 15, label: '15 min avant' },
  { value: 30, label: '30 min avant' },
  { value: 60, label: '1 heure avant' },
  { value: 1440, label: '1 jour avant' },
];

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
}

export function TaskForm({ open, onClose }: TaskFormProps) {
  const { editingTaskId, tasks, projects, tags, createTask, updateTask } = useStore();
  const editTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [recurrenceEnd, setRecurrenceEnd] = useState<string | null>(null);
  const [kanbanStatus, setKanbanStatus] = useState<KanbanStatus>('todo');
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setNotes(editTask.notes);
      setPriority(editTask.priority);
      setProjectId(editTask.project_id);
      setSelectedTags(editTask.tags);
      setDueDate(editTask.due_date);
      setDueTime(editTask.due_time);
      setRecurrence(editTask.recurrence);
      setRecurrenceEnd(editTask.recurrence_end);
      setKanbanStatus(editTask.kanban_status);
      setReminderMinutes(editTask.reminder_minutes);
    } else {
      setTitle('');
      setNotes('');
      setPriority('medium');
      setProjectId(null);
      setSelectedTags([]);
      setDueDate(null);
      setDueTime(null);
      setRecurrence('none');
      setRecurrenceEnd(null);
      setKanbanStatus('todo');
      setReminderMinutes(null);
    }
  }, [editTask, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      notes,
      priority,
      project_id: projectId,
      tags: selectedTags,
      due_date: dueDate,
      due_time: dueTime,
      recurrence,
      recurrence_end: recurrenceEnd,
      kanban_status: kanbanStatus,
      reminder_minutes: reminderMinutes,
    };

    if (editTask) {
      await updateTask({ id: editTask.id, ...payload });
    } else {
      await createTask(payload);
    }

    onClose();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const createNewTag = async () => {
    const name = tagInput.trim();
    if (!name) return;
    await useStore.getState().createTag({ name });
    const newTag = useStore.getState().tags.find((t) => t.name === name);
    if (newTag) setSelectedTags((prev) => [...prev, newTag.id]);
    setTagInput('');
  };

  return (
    <Modal open={open} onClose={onClose} title={editTask ? 'Modifier la tâche' : 'Nouvelle tâche'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la tâche…"
          className="w-full text-lg font-medium bg-transparent border-b-2 border-[var(--border)]
                     focus:border-[var(--accent)] pb-2 text-[var(--text-primary)]
                     placeholder:text-[var(--text-muted)] focus:outline-none transition-colors"
        />

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Priorité
          </label>
          <div className="flex gap-2">
            {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(
              ([p, cfg]) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-all border"
                  style={{
                    backgroundColor: priority === p ? cfg.bgColor : undefined,
                    borderColor: priority === p ? cfg.color : 'var(--border)',
                    color: priority === p ? cfg.color : 'var(--text-muted)',
                  }}
                >
                  {cfg.label}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Notes
          </label>
          <RichTextEditor
            content={notes}
            onChange={setNotes}
            placeholder="Ajouter des notes, détails, liens…"
          />
        </div>

        {/* Due date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Date d'échéance
          </label>
          <DateTimePicker
            date={dueDate}
            time={dueTime}
            onDateChange={setDueDate}
            onTimeChange={setDueTime}
          />
        </div>

        {/* Reminder */}
        {dueTime && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              Rappel
            </label>
            <select
              value={reminderMinutes ?? 'none'}
              onChange={(e) =>
                setReminderMinutes(e.target.value === 'none' ? null : Number(e.target.value))
              }
              className="w-full text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                         rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none
                         focus:ring-2 focus:ring-[var(--accent)]"
            >
              {REMINDER_OPTIONS.map((o) => (
                <option key={String(o.value)} value={o.value ?? 'none'}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Recurrence */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Répétition
          </label>
          <div className="flex gap-2 flex-wrap">
            {RECURRENCE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setRecurrence(o.value)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  recurrence === o.value
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {recurrence !== 'none' && (
            <input
              type="date"
              value={recurrenceEnd ?? ''}
              onChange={(e) => setRecurrenceEnd(e.target.value || null)}
              placeholder="Date de fin (optionnel)"
              className="text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                         rounded-lg px-3 py-1.5 text-[var(--text-primary)] focus:outline-none
                         focus:ring-2 focus:ring-[var(--accent)] w-full"
            />
          )}
        </div>

        {/* Project */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Projet
          </label>
          <select
            value={projectId ?? ''}
            onChange={(e) => setProjectId(e.target.value || null)}
            className="w-full text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                       rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none
                       focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="">Aucun projet</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Étiquettes
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="transition-all"
              >
                <Badge
                  label={tag.name}
                  color={tag.color}
                  className={selectedTags.includes(tag.id) ? 'ring-2 ring-offset-1 ring-current ring-offset-[var(--surface)]' : 'opacity-60 hover:opacity-100'}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); createNewTag(); } }}
              placeholder="Nom de l'étiquette…"
              className="flex-1 text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                         rounded-lg px-3 py-1.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <Button type="button" variant="secondary" size="sm" onClick={createNewTag}>
              + Étiquette
            </Button>
          </div>
        </div>

        {/* Kanban status */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Statut Kanban
          </label>
          <div className="flex gap-2">
            {(['todo', 'in_progress', 'done'] as KanbanStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setKanbanStatus(s)}
                className={`flex-1 py-1.5 rounded-lg text-sm border transition-colors ${
                  kanbanStatus === s
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50'
                }`}
              >
                {s === 'todo' ? 'À faire' : s === 'in_progress' ? 'En cours' : 'Terminé'}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!title.trim()}>
            {editTask ? 'Enregistrer' : 'Créer la tâche'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
