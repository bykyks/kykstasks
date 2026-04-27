import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Task, Project, Tag, Settings, View, Subtask } from '../types';
import * as db from '../lib/db';

interface AppState {
  // Data
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  settings: Settings | null;

  // UI
  activeView: View;
  selectedTaskId: string | null;
  showTaskForm: boolean;
  editingTaskId: string | null;
  searchQuery: string;
  showSettings: boolean;
  showQuickAdd: boolean;
  isLoading: boolean;

  // Actions – data
  loadAll: () => Promise<void>;
  createTask: (input: Parameters<typeof db.createTask>[0]) => Promise<Task>;
  updateTask: (input: Parameters<typeof db.updateTask>[0]) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  reorderTasks: (ids: string[]) => Promise<void>;

  createSubtask: (taskId: string, title: string) => Promise<void>;
  updateSubtask: (id: string, title?: string, completed?: boolean) => Promise<void>;
  deleteSubtask: (id: string, taskId: string) => Promise<void>;

  createProject: (input: Parameters<typeof db.createProject>[0]) => Promise<void>;
  updateProject: (input: Parameters<typeof db.updateProject>[0]) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  createTag: (input: Parameters<typeof db.createTag>[0]) => Promise<void>;
  updateTag: (id: string, name?: string, color?: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  reorderSubtasks: (taskId: string, ids: string[]) => Promise<void>;

  saveSettings: (s: Settings) => Promise<void>;

  // Actions – UI
  setView: (view: View) => void;
  selectTask: (id: string | null) => void;
  openTaskForm: (editId?: string) => void;
  closeTaskForm: () => void;
  setSearchQuery: (q: string) => void;
  toggleSettings: () => void;
  setShowQuickAdd: (show: boolean) => void;
}

export const useStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    tasks: [],
    projects: [],
    tags: [],
    settings: null,
    activeView: 'dashboard',
    selectedTaskId: null,
    showTaskForm: false,
    editingTaskId: null,
    searchQuery: '',
    showSettings: false,
    showQuickAdd: false,
    isLoading: true,

    loadAll: async () => {
      set({ isLoading: true });
      try {
        const [tasks, projects, tags, settings] = await Promise.all([
          db.getTasks(),
          db.getProjects(),
          db.getTags(),
          db.getSettings(),
        ]);
        set({ tasks, projects, tags, settings, isLoading: false });
      } catch (err) {
        console.error('loadAll failed:', err);
        set({ isLoading: false });
      }
    },

    createTask: async (input) => {
      const task = await db.createTask(input);
      set((s) => ({ tasks: [...s.tasks, task] }));
      return task;
    },

    updateTask: async (input) => {
      const updated = await db.updateTask(input);
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === updated.id ? updated : t)),
      }));
      // If completing a recurring task, reload to pick up the new occurrence
      if (input.completed) {
        const reloaded = await db.getTasks();
        set({ tasks: reloaded });
      }
    },

    deleteTask: async (id) => {
      await db.deleteTask(id);
      set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== id),
        selectedTaskId: s.selectedTaskId === id ? null : s.selectedTaskId,
      }));
    },

    toggleTask: async (id) => {
      const task = get().tasks.find((t) => t.id === id);
      if (!task) return;
      await get().updateTask({ id, completed: !task.completed });
    },

    reorderTasks: async (ids) => {
      await db.reorderTasks(ids);
      const tasksMap = new Map(get().tasks.map((t) => [t.id, t]));
      const reordered = ids
        .map((id, i) => ({ ...tasksMap.get(id)!, position: i }))
        .filter(Boolean);
      set((s) => ({
        tasks: [
          ...reordered,
          ...s.tasks.filter((t) => !ids.includes(t.id)),
        ],
      }));
    },

    createSubtask: async (taskId, title) => {
      const sub = await db.createSubtask({ task_id: taskId, title });
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === taskId ? { ...t, subtasks: [...t.subtasks, sub] } : t,
        ),
      }));
    },

    updateSubtask: async (id, title, completed) => {
      await db.updateSubtask(id, title, completed);
      set((s) => ({
        tasks: s.tasks.map((t) => ({
          ...t,
          subtasks: t.subtasks.map((sub) =>
            sub.id === id
              ? { ...sub, ...(title !== undefined && { title }), ...(completed !== undefined && { completed }) }
              : sub,
          ),
        })),
      }));
    },

    deleteSubtask: async (id, taskId) => {
      await db.deleteSubtask(id);
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: t.subtasks.filter((sub) => sub.id !== id) }
            : t,
        ),
      }));
    },

    reorderSubtasks: async (taskId, ids) => {
      await db.reorderSubtasks(ids);
      set((s) => ({
        tasks: s.tasks.map((t) => {
          if (t.id !== taskId) return t;
          const subMap = new Map(t.subtasks.map((sub) => [sub.id, sub]));
          const reordered = ids.map((id, i) => ({ ...subMap.get(id)!, position: i }));
          return { ...t, subtasks: reordered };
        }),
      }));
    },

    createProject: async (input) => {
      const project = await db.createProject(input);
      set((s) => ({ projects: [...s.projects, project] }));
    },

    updateProject: async (input) => {
      const updated = await db.updateProject(input);
      set((s) => ({
        projects: s.projects.map((p) => (p.id === updated.id ? updated : p)),
      }));
    },

    deleteProject: async (id) => {
      await db.deleteProject(id);
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== id),
        tasks: s.tasks.map((t) =>
          t.project_id === id ? { ...t, project_id: null } : t,
        ),
      }));
    },

    createTag: async (input) => {
      const tag = await db.createTag(input);
      set((s) => ({ tags: [...s.tags, tag] }));
    },

    updateTag: async (id, name, color) => {
      await db.updateTag(id, name, color);
      set((s) => ({
        tags: s.tags.map((t) =>
          t.id === id
            ? { ...t, ...(name !== undefined && { name }), ...(color !== undefined && { color }) }
            : t,
        ),
      }));
    },

    deleteTag: async (id) => {
      await db.deleteTag(id);
      set((s) => ({
        tags: s.tags.filter((t) => t.id !== id),
        tasks: s.tasks.map((t) => ({
          ...t,
          tags: t.tags.filter((tid) => tid !== id),
        })),
      }));
    },

    saveSettings: async (settings) => {
      await db.saveSettings(settings);
      set({ settings });
    },

    setView: (view) =>
      set({ activeView: view, selectedTaskId: null, searchQuery: '' }),
    selectTask: (id) => set({ selectedTaskId: id }),
    openTaskForm: (editId) =>
      set({ showTaskForm: true, editingTaskId: editId ?? null }),
    closeTaskForm: () =>
      set({ showTaskForm: false, editingTaskId: null }),
    setSearchQuery: (q) => set({ searchQuery: q }),
    toggleSettings: () => set((s) => ({ showSettings: !s.showSettings })),
    setShowQuickAdd: (show) => set({ showQuickAdd: show }),
  })),
);
