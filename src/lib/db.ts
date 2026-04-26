import { supabase, getUserId } from './supabase';
import type { Task, Project, Tag, Settings, Subtask } from '../types';

function mapTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes ?? '',
    priority: row.priority,
    project_id: row.project_id,
    tags: (row.task_tags ?? []).map((tt: any) => tt.tag_id),
    due_date: row.due_date,
    due_time: row.due_time,
    completed: row.completed,
    completed_at: row.completed_at,
    position: row.position,
    recurrence: row.recurrence,
    recurrence_end: row.recurrence_end,
    kanban_status: row.kanban_status,
    reminder_minutes: row.reminder_minutes,
    subtasks: [...(row.subtasks ?? [])].sort((a: Subtask, b: Subtask) => a.position - b.position),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export async function getTasks(): Promise<Task[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('tasks')
    .select('*, subtasks(*), task_tags(tag_id)')
    .eq('user_id', userId)
    .order('position');
  if (error) throw error;
  return (data ?? []).map(mapTask);
}

export async function createTask(input: {
  title: string;
  notes?: string;
  priority?: string;
  project_id?: string | null;
  tags?: string[];
  due_date?: string | null;
  due_time?: string | null;
  recurrence?: string;
  recurrence_end?: string | null;
  kanban_status?: string;
  reminder_minutes?: number | null;
}): Promise<Task> {
  const userId = await getUserId();
  const { tags = [], ...rest } = input;

  const { data: existing } = await supabase
    .from('tasks')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1);
  const position = existing?.[0] ? existing[0].position + 1 : 0;

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      position,
      notes: '',
      priority: 'medium',
      recurrence: 'none',
      kanban_status: 'todo',
      ...rest,
    })
    .select()
    .single();
  if (error) throw error;

  if (tags.length > 0) {
    await supabase.from('task_tags').insert(
      tags.map((tag_id) => ({ task_id: task.id, tag_id, user_id: userId })),
    );
  }

  return { ...task, tags, subtasks: [] };
}

export async function updateTask(input: {
  id: string;
  title?: string;
  notes?: string;
  priority?: string;
  project_id?: string | null;
  tags?: string[];
  due_date?: string | null;
  due_time?: string | null;
  completed?: boolean;
  recurrence?: string;
  recurrence_end?: string | null;
  kanban_status?: string;
  reminder_minutes?: number | null;
  position?: number;
}): Promise<Task> {
  const userId = await getUserId();
  const { id, tags, ...rest } = input;

  const patch: Record<string, any> = { ...rest };
  if (input.completed === true) patch.completed_at = new Date().toISOString();
  if (input.completed === false) patch.completed_at = null;

  const { data: task, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, subtasks(*), task_tags(tag_id)')
    .single();
  if (error) throw error;

  let finalTags = (task.task_tags ?? []).map((tt: any) => tt.tag_id);

  if (tags !== undefined) {
    await supabase.from('task_tags').delete().eq('task_id', id);
    if (tags.length > 0) {
      await supabase.from('task_tags').insert(
        tags.map((tag_id) => ({ task_id: id, tag_id, user_id: userId })),
      );
    }
    finalTags = tags;
  }

  if (input.completed === true && task.recurrence !== 'none') {
    await spawnNextRecurrence(task, userId);
  }

  return mapTask({ ...task, task_tags: finalTags.map((tag_id: string) => ({ tag_id })) });
}

async function spawnNextRecurrence(task: any, userId: string): Promise<void> {
  if (!task.due_date) return;
  const d = new Date(task.due_date + 'T00:00:00');

  if (task.recurrence === 'daily') d.setDate(d.getDate() + 1);
  else if (task.recurrence === 'weekly') d.setDate(d.getDate() + 7);
  else if (task.recurrence === 'monthly') d.setMonth(d.getMonth() + 1);

  const nextDate = d.toISOString().slice(0, 10);
  if (task.recurrence_end && nextDate > task.recurrence_end) return;

  const { data: newTask, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: task.title,
      notes: task.notes,
      priority: task.priority,
      project_id: task.project_id,
      due_date: nextDate,
      due_time: task.due_time,
      recurrence: task.recurrence,
      recurrence_end: task.recurrence_end,
      kanban_status: task.kanban_status,
      reminder_minutes: task.reminder_minutes,
      position: task.position,
    })
    .select()
    .single();
  if (error || !newTask) return;

  const tagIds = (task.task_tags ?? []).map((tt: any) => tt.tag_id);
  if (tagIds.length > 0) {
    await supabase.from('task_tags').insert(
      tagIds.map((tag_id: string) => ({ task_id: newTask.id, tag_id, user_id: userId })),
    );
  }
}

export async function deleteTask(id: string): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function reorderTasks(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id, position) =>
      supabase.from('tasks').update({ position }).eq('id', id),
    ),
  );
}

// ── Subtasks ───────────────────────────────────────────────────────────────

export async function createSubtask(input: {
  task_id: string;
  title: string;
}): Promise<Subtask> {
  const userId = await getUserId();
  const { data: existing } = await supabase
    .from('subtasks')
    .select('position')
    .eq('task_id', input.task_id)
    .order('position', { ascending: false })
    .limit(1);
  const position = existing?.[0] ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from('subtasks')
    .insert({ ...input, user_id: userId, position, completed: false })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSubtask(
  id: string,
  title?: string,
  completed?: boolean,
): Promise<void> {
  const patch: Record<string, any> = {};
  if (title !== undefined) patch.title = title;
  if (completed !== undefined) patch.completed = completed;
  const { error } = await supabase.from('subtasks').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteSubtask(id: string): Promise<void> {
  const { error } = await supabase.from('subtasks').delete().eq('id', id);
  if (error) throw error;
}

// ── Projects ───────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('position');
  if (error) throw error;
  return data ?? [];
}

export async function createProject(input: {
  name: string;
  color?: string;
  icon?: string;
}): Promise<Project> {
  const userId = await getUserId();
  const { data: existing } = await supabase
    .from('projects')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1);
  const position = existing?.[0] ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: input.name,
      color: input.color ?? '#6366f1',
      icon: input.icon ?? 'folder',
      position,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(input: {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
}): Promise<Project> {
  const userId = await getUserId();
  const { id, ...rest } = input;
  const { data, error } = await supabase
    .from('projects')
    .update(rest)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function reorderProjects(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id, position) =>
      supabase.from('projects').update({ position }).eq('id', id),
    ),
  );
}

// ── Tags ───────────────────────────────────────────────────────────────────

export async function getTags(): Promise<Tag[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data ?? [];
}

export async function createTag(input: {
  name: string;
  color?: string;
}): Promise<Tag> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('tags')
    .insert({
      user_id: userId,
      name: input.name,
      color: input.color ?? '#6366f1',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTag(
  id: string,
  name?: string,
  color?: string,
): Promise<void> {
  const patch: Record<string, any> = {};
  if (name !== undefined) patch.name = name;
  if (color !== undefined) patch.color = color;
  const { error } = await supabase.from('tags').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteTag(id: string): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

// ── Settings ───────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  reminder_default: 15,
  daily_digest_enabled: false,
  daily_digest_time: '09:00',
  backup_enabled: false,
};

export async function getSettings(): Promise<Settings> {
  const userId = await getUserId();
  const { data } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) {
    await supabase.from('settings').insert({ user_id: userId, ...DEFAULT_SETTINGS });
    return DEFAULT_SETTINGS;
  }

  return {
    theme: data.theme ?? DEFAULT_SETTINGS.theme,
    reminder_default: data.reminder_default ?? DEFAULT_SETTINGS.reminder_default,
    daily_digest_enabled: data.daily_digest_enabled ?? DEFAULT_SETTINGS.daily_digest_enabled,
    daily_digest_time: data.daily_digest_time ?? DEFAULT_SETTINGS.daily_digest_time,
    backup_enabled: data.backup_enabled ?? DEFAULT_SETTINGS.backup_enabled,
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase
    .from('settings')
    .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' });
  if (error) throw error;
}

// ── Export / Import ────────────────────────────────────────────────────────

export async function exportJsonData(): Promise<string> {
  const userId = await getUserId();
  const [tasks, projects, tags, taskTags, subtasks] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', userId),
    supabase.from('projects').select('*').eq('user_id', userId),
    supabase.from('tags').select('*').eq('user_id', userId),
    supabase.from('task_tags').select('*').eq('user_id', userId),
    supabase.from('subtasks').select('*').eq('user_id', userId),
  ]);
  return JSON.stringify(
    {
      tasks: tasks.data ?? [],
      projects: projects.data ?? [],
      tags: tags.data ?? [],
      task_tags: taskTags.data ?? [],
      subtasks: subtasks.data ?? [],
      exported_at: new Date().toISOString(),
    },
    null,
    2,
  );
}

export async function exportCsvData(): Promise<string> {
  const userId = await getUserId();
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);
  const headers = ['title', 'priority', 'due_date', 'completed', 'created_at'];
  const rows = (tasks ?? []).map((t) =>
    headers.map((h) => JSON.stringify(t[h as keyof typeof t] ?? '')).join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export async function importJsonData(json: string): Promise<void> {
  const userId = await getUserId();
  const backup = JSON.parse(json);

  await Promise.all([
    supabase.from('task_tags').delete().eq('user_id', userId),
    supabase.from('subtasks').delete().eq('user_id', userId),
  ]);
  await supabase.from('tasks').delete().eq('user_id', userId);
  await supabase.from('projects').delete().eq('user_id', userId);
  await supabase.from('tags').delete().eq('user_id', userId);

  if (backup.projects?.length) {
    await supabase.from('projects').insert(
      backup.projects.map((p: any) => ({ ...p, user_id: userId })),
    );
  }
  if (backup.tags?.length) {
    await supabase.from('tags').insert(
      backup.tags.map((t: any) => ({ ...t, user_id: userId })),
    );
  }
  if (backup.tasks?.length) {
    await supabase.from('tasks').insert(
      backup.tasks.map((t: any) => ({ ...t, user_id: userId })),
    );
  }
  if (backup.task_tags?.length) {
    await supabase.from('task_tags').insert(
      backup.task_tags.map((tt: any) => ({ ...tt, user_id: userId })),
    );
  }
  if (backup.subtasks?.length) {
    await supabase.from('subtasks').insert(
      backup.subtasks.map((s: any) => ({ ...s, user_id: userId })),
    );
  }
}

// ── Notification helpers ───────────────────────────────────────────────────

export async function getTodayDigest(): Promise<Task[]> {
  const userId = await getUserId();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .eq('due_date', today);
  return (data ?? []).map((t) => ({ ...t, tags: [], subtasks: [] } as Task));
}

export async function getDueSoonTasks(withinMinutes: number): Promise<
  Array<{
    id: string;
    title: string;
    due_date: string;
    due_time: string | null;
    reminder_minutes: number;
  }>
> {
  const userId = await getUserId();
  const { data } = await supabase
    .from('tasks')
    .select('id, title, due_date, due_time, reminder_minutes')
    .eq('user_id', userId)
    .eq('completed', false)
    .not('due_date', 'is', null)
    .not('due_time', 'is', null)
    .not('reminder_minutes', 'is', null);

  const now = new Date();
  return (data ?? []).filter((task) => {
    const dueMs = new Date(`${task.due_date}T${task.due_time}`).getTime();
    const reminderMs = dueMs - task.reminder_minutes * 60_000;
    const diff = reminderMs - now.getTime();
    return diff >= 0 && diff <= withinMinutes * 60_000;
  });
}
