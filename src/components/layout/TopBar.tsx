import React from 'react';
import { Search, Plus, Sun, Moon, Monitor, Menu } from 'lucide-react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import type { View, Theme } from '../../types';

const VIEW_LABELS: Record<string, string> = {
  today: "Aujourd'hui",
  upcoming: 'À venir',
  all: 'Toutes les tâches',
  search: 'Recherche',
  kanban: 'Kanban',
};

function viewLabel(view: View): string {
  if (typeof view === 'string') return VIEW_LABELS[view] ?? view;
  return '';
}

function ThemeToggle() {
  const settings = useStore((s) => s.settings);
  const saveSettings = useStore((s) => s.saveSettings);
  if (!settings) return null;

  const cycle = () => {
    const order: Theme[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(settings.theme) + 1) % 3];
    saveSettings({ ...settings, theme: next });
  };

  const Icon =
    settings.theme === 'light' ? Sun :
    settings.theme === 'dark' ? Moon : Monitor;

  return (
    <Button variant="ghost" size="icon" onClick={cycle} title={`Thème : ${settings.theme}`}>
      <Icon size={16} />
    </Button>
  );
}

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { activeView, searchQuery, setSearchQuery, setView, openTaskForm } = useStore();

  return (
    <header className="flex items-center gap-3 px-4 md:px-5 h-14 border-b border-[var(--border)] shrink-0">
      {/* Hamburger - mobile only */}
      <button
        className="md:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
        onClick={onMenuToggle}
        aria-label="Menu"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <h1 className="text-lg font-semibold text-[var(--text-primary)] min-w-0 truncate">
        {viewLabel(activeView)}
      </h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        />
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value) setView('search');
            else setView('today');
          }}
          onFocus={() => { if (searchQuery) setView('search'); }}
          placeholder="Rechercher… (/)"
          className="pl-8 pr-3 py-1.5 text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                     rounded-lg w-36 md:w-52 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:w-48 md:focus:w-72 transition-all"
        />
      </div>

      <ThemeToggle />

      <Button
        variant="primary"
        size="sm"
        onClick={() => openTaskForm()}
      >
        <Plus size={14} />
        <span className="hidden sm:inline">Nouvelle tâche</span>
        <span className="sm:hidden">+</span>
        <span className="ml-1 opacity-60 text-xs hidden sm:inline">n</span>
      </Button>
    </header>
  );
}
