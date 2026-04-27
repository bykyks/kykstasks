import React from 'react';
import { Search, Plus, Sun, Moon, Monitor, Menu } from 'lucide-react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import type { View, Theme } from '../../types';

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
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
    <header className="flex items-center gap-3 px-5 md:px-6 h-16 border-b border-[var(--border)] shrink-0 bg-[var(--surface)]">
      {/* Hamburger - mobile only */}
      <button
        className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
        onClick={onMenuToggle}
        aria-label="Menu"
      >
        <Menu size={22} />
      </button>

      {/* Title */}
      <h1 className="text-xl font-bold text-[var(--text-primary)] min-w-0 truncate tracking-tight">
        {viewLabel(activeView)}
      </h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
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
          className="pl-9 pr-3 py-2 text-sm bg-[var(--surface-hover)] border-2 border-[var(--border)]
                     rounded-xl w-40 md:w-56 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--accent)] focus:w-52 md:focus:w-80 transition-all"
        />
      </div>

      <ThemeToggle />

      <Button
        variant="primary"
        size="md"
        onClick={() => openTaskForm()}
      >
        <Plus size={16} />
        <span className="hidden sm:inline font-semibold">Nouvelle tâche</span>
        <span className="sm:hidden font-semibold">+</span>
      </Button>
    </header>
  );
}
