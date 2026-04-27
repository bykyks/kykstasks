import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Calendar, List, KanbanSquare, Tag, Plus, Settings,
  ChevronDown, ChevronRight, Trash2, Zap, Pencil, LayoutDashboard,
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
  onClose?: () => void;
}

function NavItem({ icon, label, view, badge, onClose }: NavItemProps) {
  const { activeView, setView } = useStore();
  const isActive =
    typeof view === 'string'
      ? activeView === view
      : typeof activeView === 'object' &&
        activeView.type === (view as { type: string; id: string }).type &&
        (activeView as { type: string; id: string }).id === (view as { type: string; id: string }).id;

  return (
    <button
      onClick={() => { setView(view); onClose?.(); }}
      className={cn(
        'w-full flex items-center gap-2.5 px-[11px] py-2 rounded-[9px] text-[13.5px] font-medium transition-all duration-150',
        isActive
          ? 'bg-[var(--accent)] text-white'
          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left truncate tracking-[-0.1px]">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          'text-[11px] rounded-full min-w-[20px] h-[18px] flex items-center justify-center px-1.5 font-bold',
          isActive ? 'bg-white/25 text-white' : 'bg-[var(--accent)]/15 text-[var(--accent)]',
        )}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { tasks, projects, tags, deleteProject, deleteTag, updateTag } = useStore();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = tasks.filter(
    (t) => !t.completed && (t.due_date === today || (t.due_date && t.due_date < today)),
  ).length;

  const handleSaveTagName = async (id: string) => {
    const name = editingTagName.trim();
    if (name) await updateTag(id, name);
    setEditingTagId(null);
  };

  return (
    <aside className={cn(
      'w-[228px] flex flex-col h-full bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]',
      'fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out',
      'md:relative md:translate-x-0 md:z-auto',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    )}>
      {/* App brand */}
      <div className="px-[18px] pt-[22px] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-[9px] bg-[var(--accent)] flex items-center justify-center shrink-0">
            <Zap size={14} color="white" fill="white" />
          </div>
          <span className="font-bold text-[15px] text-[var(--text-primary)] tracking-[-0.3px]">Kykstasks</span>
        </div>
      </div>

      {/* Quick add */}
      <div className="px-3 pb-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full justify-start gap-2 text-[13px] font-semibold rounded-[10px]"
          onClick={() => { useStore.getState().openTaskForm(); onClose?.(); }}
        >
          <Plus size={16} />
          Nouvelle tâche
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-0 flex flex-col gap-px">
        {/* Core views */}
        <NavItem icon={<LayoutDashboard size={14} />} label="Dashboard" view="dashboard" onClose={onClose} />
        <NavItem icon={<Sun size={14} />} label="Aujourd'hui" view="today" badge={todayCount} onClose={onClose} />
        <NavItem icon={<Calendar size={14} />} label="À venir" view="upcoming" onClose={onClose} />
        <NavItem icon={<List size={14} />} label="Toutes les tâches" view="all" onClose={onClose} />
        <NavItem icon={<KanbanSquare size={14} />} label="Kanban" view="kanban" onClose={onClose} />

        <div className="h-px bg-[var(--sidebar-border)] mx-1 my-3.5" />

        {/* Projects */}
        <div>
          <button
            onClick={() => setProjectsOpen((o) => !o)}
            className="w-full flex items-center gap-1.5 px-[11px] py-[6px] text-[10px] font-bold
                       text-[var(--text-muted)] uppercase tracking-[0.09em] hover:text-[var(--text-secondary)]"
          >
            {projectsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            Projets
            <span className="ml-auto">
              <button
                onClick={(e) => { e.stopPropagation(); setShowProjectForm(true); }}
                className="p-0.5 hover:text-[var(--accent)] rounded transition-colors"
              >
                <Plus size={12} />
              </button>
            </span>
          </button>
          {projectsOpen && (
            <div className="mt-0.5 flex flex-col gap-px">
              {projects.map((p) => (
                <div key={p.id} className="group relative">
                  <NavItem
                    icon={
                      <span style={{ color: p.color }}>
                        {getIcon(p.icon, 14)}
                      </span>
                    }
                    label={p.name}
                    view={{ type: 'project', id: p.id }}
                    badge={tasks.filter((t) => !t.completed && t.project_id === p.id).length || undefined}
                    onClose={onClose}
                  />
                  <button
                    onClick={() => deleteProject(p.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                               opacity-0 group-hover:opacity-100 text-[var(--text-muted)]
                               hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="px-[11px] py-2 text-[13px] text-[var(--text-muted)]">Aucun projet</p>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mt-1">
          <button
            onClick={() => setTagsOpen((o) => !o)}
            className="w-full flex items-center gap-1.5 px-[11px] py-[6px] text-[10px] font-bold
                       text-[var(--text-muted)] uppercase tracking-[0.09em] hover:text-[var(--text-secondary)]"
          >
            {tagsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            Étiquettes
          </button>
          {tagsOpen && (
            <div className="mt-0.5 flex flex-col gap-px">
              {tags.map((tag) => (
                <div key={tag.id} className="group relative">
                  {editingTagId === tag.id ? (
                    <div className="flex items-center gap-2.5 px-[11px] py-2">
                      <Tag size={14} style={{ color: tag.color }} className="shrink-0" />
                      <input
                        autoFocus
                        value={editingTagName}
                        onChange={(e) => setEditingTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTagName(tag.id);
                          if (e.key === 'Escape') setEditingTagId(null);
                        }}
                        onBlur={() => handleSaveTagName(tag.id)}
                        className="flex-1 text-[13px] bg-transparent border-b-2 border-[var(--accent)]
                                   text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                  ) : (
                    <>
                      <NavItem
                        icon={<Tag size={14} style={{ color: tag.color }} />}
                        label={tag.name}
                        view={{ type: 'tag', id: tag.id }}
                        onClose={onClose}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5
                                      opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTagId(tag.id);
                            setEditingTagName(tag.name);
                          }}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--surface-active)] transition-all"
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          onClick={() => deleteTag(tag.id)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom — Settings */}
      <div className="px-2 py-2.5 border-t border-[var(--sidebar-border)]">
        <button
          onClick={() => { useStore.getState().toggleSettings(); onClose?.(); }}
          className="w-full flex items-center gap-2.5 px-[11px] py-2 rounded-[9px] text-[13.5px] font-medium
                     text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]
                     hover:text-[var(--text-primary)] transition-colors"
        >
          <Settings size={14} />
          Paramètres
          <span className="ml-auto text-[11px] text-[var(--text-muted)]">⌘,</span>
        </button>
      </div>

      <ProjectForm open={showProjectForm} onClose={() => setShowProjectForm(false)} />
    </aside>
  );
}
