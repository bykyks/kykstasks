import React, { useState } from 'react';
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
import { TaskDetail } from '../tasks/TaskDetail';
import { SettingsPanel } from '../settings/SettingsPanel';
import { QuickAdd } from '../ui/QuickAdd';

function MainContent() {
  const activeView = useStore((s) => s.activeView);

  if (activeView === 'dashboard') return <DashboardView />;
  if (activeView === 'today') return <TodayView />;
  if (activeView === 'upcoming') return <UpcomingView />;
  if (activeView === 'all') return <AllTasksView />;
  if (activeView === 'search') return <SearchView />;
  if (activeView === 'kanban') return <KanbanView />;
  if (activeView === 'stats') return <StatsView />;
  if (typeof activeView === 'object' && activeView.type === 'project')
    return <ProjectView id={activeView.id} />;
  if (typeof activeView === 'object' && activeView.type === 'tag')
    return <TagView id={activeView.id} />;
  return null;
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showTaskForm, closeTaskForm, selectedTaskId, selectTask, showSettings } = useStore();

  return (
    <div className="flex h-screen bg-[var(--bg)] overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto">
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

      <TaskForm open={showTaskForm} onClose={closeTaskForm} />
      {showSettings && <SettingsPanel />}
      <QuickAdd />
    </div>
  );
}
