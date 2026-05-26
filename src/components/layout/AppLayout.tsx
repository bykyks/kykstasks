import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useStore } from '../../store';
import { DashboardView } from '../views/DashboardView';
import { TodayView } from '../views/TodayView';
import { UpcomingView } from '../views/UpcomingView';
import { AllTasksView } from '../views/AllTasksView';
import { SearchView } from '../views/SearchView';
import { KanbanView } from '../views/KanbanView';
import { ProjectView } from '../views/ProjectView';
import { TagView } from '../views/TagView';
import { StatsView } from '../views/StatsView';
import { TaskForm } from '../tasks/TaskForm';
import { QuickTaskForm } from '../tasks/QuickTaskForm';
import { TaskDetail } from '../tasks/TaskDetail';
import { SettingsPanel } from '../settings/SettingsPanel';
import { QuickAdd } from '../ui/QuickAdd';

function MainContent() {
  const activeView = useStore((s) => s.activeView);
  const viewKey = typeof activeView === 'string' ? activeView : `${(activeView as { type: string; id: string }).type}-${(activeView as { type: string; id: string }).id}`;

  let content: React.ReactNode = null;
  if (activeView === 'dashboard') content = <DashboardView />;
  else if (activeView === 'today') content = <TodayView />;
  else if (activeView === 'upcoming') content = <UpcomingView />;
  else if (activeView === 'all') content = <AllTasksView />;
  else if (activeView === 'search') content = <SearchView />;
  else if (activeView === 'kanban') content = <KanbanView />;
  else if (activeView === 'stats') content = <StatsView />;
  else if (typeof activeView === 'object' && activeView.type === 'project')
    content = <ProjectView id={(activeView as { type: string; id: string }).id} />;
  else if (typeof activeView === 'object' && activeView.type === 'tag')
    content = <TagView id={(activeView as { type: string; id: string }).id} />;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.14 } }}
        exit={{ opacity: 0, transition: { duration: 0.08 } }}
        className="h-full"
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    localStorage.getItem('sidebar-collapsed') === 'true',
  );

  const { showTaskForm, closeTaskForm, editingTaskId, selectedTaskId, selectTask, showSettings } = useStore();

  const mainRef = useRef<HTMLElement>(null);
  const savedScroll = useRef(0);

  useEffect(() => {
    if (showTaskForm) {
      savedScroll.current = mainRef.current?.scrollTop ?? 0;
    } else {
      const el = mainRef.current;
      if (el && savedScroll.current > 0) {
        setTimeout(() => { el.scrollTop = savedScroll.current; }, 50);
      }
    }
  }, [showTaskForm]);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((c) => {
      const next = !c;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-[var(--bg)] overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          onToggleSidebar={toggleSidebarCollapse}
        />
        <div className="flex-1 flex overflow-hidden">
          <main ref={mainRef} className="flex-1 overflow-y-auto">
            <MainContent />
          </main>

          {selectedTaskId && (
            <aside className="fixed inset-0 z-50 bg-[var(--bg)] overflow-y-auto md:relative md:inset-auto md:z-auto md:w-96 md:border-l md:border-[var(--border)] shrink-0">
              <TaskDetail
                taskId={selectedTaskId}
                onClose={() => selectTask(null)}
              />
            </aside>
          )}
        </div>
      </div>

      {showTaskForm && (
        editingTaskId
          ? <TaskForm open={true} onClose={closeTaskForm} />
          : <QuickTaskForm onClose={closeTaskForm} />
      )}
      {showSettings && <SettingsPanel />}
      <QuickAdd />
    </div>
  );
}
