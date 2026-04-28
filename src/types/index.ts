export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';
export type KanbanStatus = 'todo' | 'in_progress' | 'done';
export type Theme = 'light' | 'dark' | 'system';
export type View =
  | 'dashboard'
  | 'today'
  | 'upcoming'
  | 'all'
  | 'search'
  | 'kanban'
  | 'stats'
  | { type: 'project'; id: string }
  | { type: 'tag'; id: string };

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  position: number;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  project_id: string | null;
  tags: string[];
  due_date: string | null;
  due_time: string | null;
  completed: boolean;
  completed_at: string | null;
  position: number;
  recurrence: RecurrenceType;
  recurrence_end: string | null;
  kanban_status: KanbanStatus;
  reminder_minutes: number | null;
  subtasks: Subtask[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Settings {
  theme: Theme;
  reminder_default: number;
  daily_digest_enabled: boolean;
  daily_digest_time: string;
  backup_enabled: boolean;
}

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bgColor: string }
> = {
  low:    { label: 'Basse',   color: '#9CA3AF', bgColor: '#9CA3AF1a' },
  medium: { label: 'Moyenne', color: '#EAB308', bgColor: '#EAB3081a' },
  high:   { label: 'Haute',   color: '#f97316', bgColor: '#f973161a' },
  urgent: { label: 'Urgente', color: '#ef4444', bgColor: '#ef44441a' },
};

export const PROJECT_ICONS = [
  'folder', 'briefcase', 'home', 'star', 'heart', 'zap', 'book',
  'code', 'music', 'camera', 'coffee', 'globe', 'shopping-cart',
  'target', 'trending-up', 'users', 'calendar', 'flag',
];

export const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#06b6d4',
  '#64748b', '#6b7280',
];
