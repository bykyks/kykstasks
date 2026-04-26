import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Calendar, List, KanbanSquare, Tag, Plus, Settings,
  ChevronDown, ChevronRight, Trash2, Zap,
} from 'lucide-react';
import { useStore } from '../../store';
import type { View } from '../../types';
import { getIcon } from '../ui/IconPicker';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { ProjectForm } from '../projects/ProjectForm';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  view: View;
  badge?: number;
}

function NavItem({ icon, label, view, badge }: NavItemProps) {
  const { activeView, setView } = useStore();
  const isActive =
    typeof view === 'string'
      ? activeView === view
      : typeof activeView === 'object' &&
        activeView.type === (view as { type: string; id: string }).type &&
        (activeView as { type: string; id: string }).id === (view as { type: string; id: string }).id;

  return (
    <button
      onClick={() => setView(view)}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors',
        isActive
          ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-medium'
          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-xs bg-[var(--accent)] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar() {
  const { tasks, projects, tags, deleteProject, deleteTag, setView } = useStore();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = tasks.filter(
    (t) => !t.completed && (t.due_date === today || (t.due_date && t.due_date < today)),
  ).length;

  return (
    <aside className="w-64 flex flex-col h-full bg-[var(--surface-hover)] border-r border-[var(--border)]">
      {/* App brand */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center">
            <Zap size={16} color="white" fill="white" />
          </div>
          <span className="font-bold text-base text-[var(--text-primary)]">Kykstasks</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-3 pb-2">
        <Button
          variant="primary"
          className="w-full justify-start gap-2"
          onClick={() => useStore.getState().openTaskForm()}
        >
          <Plus size={16} />
          Nouvelle tâche
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {/* Core views */}
        <NavItem icon={<Sun size={16} />} label="Aujourd'hui" view="today" badge={todayCount} />
        <NavItem icon={<Calendar size={16} />} label="À venir" view="upcoming" />
        <NavItem icon={<List size={16} />} label="Toutes les tâches" view="all" />
        <NavItem icon={<KanbanSquare size={16} />} label="Kanban" view="kanban" />

        <div className="pt-2" />

        {/* Projects */}
        <div>
          <button
            onClick={() => setProjectsOpen((o) => !o)}
            className="w-full flex items-center gap-1.5 px-2 py-1 text-xs font-semibold
                       text-[var(--text-muted)] uppercase tracking-wide hover:text-[var(--text-secondary)]"
          >
            {projectsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Projets
            <span className="ml-auto">
              <button
                onClick={(e) => { e.stopPropagation(); setShowProjectForm(true); }}
                className="p-0.5 hover:text-[var(--accent)] rounded"
              >
                <Plus size={12} />
              </button>
            </span>
          </button>
          {projectsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {projects.map((p) => (
                <div key={p.id} className="group relative">
                  <NavItem
                    icon={
                      <span style={{ color: p.color }}>
                        {getIcon(p.icon, 15)}
                      </span>
                    }
                    label={p.name}
                    view={{ type: 'project', id: p.id }}
                    badge={tasks.filter((t) => !t.completed && t.project_id === p.id).length || undefined}
                  />
                  <button
                    onClick={() => deleteProject(p.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded
                               opacity-0 group-hover:opacity-100 text-[var(--text-muted)]
                               hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="px-3 py-1.5 text-xs text-[var(--text-muted)]">Aucun projet</p>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="pt-1">
          <button
            onClick={() => setTagsOpen((o) => !o)}
            className="w-full flex items-center gap-1.5 px-2 py-1 text-xs font-semibold
                       text-[var(--text-muted)] uppercase tracking-wide hover:text-[var(--text-secondary)]"
          >
            {tagsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Étiquettes
          </button>
          {tagsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {tags.map((tag) => (
                <div key={tag.id} className="group relative">
                  <NavItem
                    icon={<Tag size={14} style={{ color: tag.color }} />}
                    label={tag.name}
                    view={{ type: 'tag', id: tag.id }}
                  />
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded
                               opacity-0 group-hover:opacity-100 text-[var(--text-muted)]
                               hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-[var(--border)]">
        <button
          onClick={() => useStore.getState().toggleSettings()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm
                     text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]
                     hover:text-[var(--text-primary)] transition-colors"
        >
          <Settings size={16} />
          Paramètres
          <span className="ml-auto text-xs text-[var(--text-muted)]">⌘,</span>
        </button>
      </div>

      <ProjectForm open={showProjectForm} onClose={() => setShowProjectForm(false)} />
    </aside>
  );
}
