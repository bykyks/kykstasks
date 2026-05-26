import React from 'react';
import { Search, Menu, PanelLeft } from 'lucide-react';
import { useStore } from '../../store';

interface TopBarProps {
  onMenuToggle?: () => void;
  onToggleSidebar?: () => void;
}

export function TopBar({ onMenuToggle, onToggleSidebar }: TopBarProps) {
  const { searchQuery, setSearchQuery, setView } = useStore();

  return (
    <header className="flex items-center gap-2 px-5 md:px-4 h-12 border-b border-[var(--border)] shrink-0 bg-[var(--surface)]">
      {/* Hamburger - mobile only */}
      <button
        className="md:hidden p-2 rounded-[9px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
        onClick={onMenuToggle}
        aria-label="Menu"
      >
        <Menu size={18} />
      </button>

      {/* Sidebar toggle - desktop only */}
      {onToggleSidebar && (
        <button
          className="hidden md:flex p-1.5 rounded-[9px] text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)] transition-colors"
          onClick={onToggleSidebar}
          aria-label="Réduire/développer le menu"
          title="Réduire/développer le menu"
        >
          <PanelLeft size={15} />
        </button>
      )}

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <Search
          size={13}
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
          placeholder="Rechercher…"
          className="pl-8 pr-8 py-1.5 text-[13px] bg-[var(--bg)] border border-[var(--border)]
                     rounded-[9px] w-40 md:w-52 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--accent)] focus:w-48 md:focus:w-72 transition-all"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--text-muted)] bg-[var(--border)] rounded px-[5px] py-px pointer-events-none">/</span>
      </div>

    </header>
  );
}
