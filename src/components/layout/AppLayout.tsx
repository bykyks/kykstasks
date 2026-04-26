import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useStore } from '../../store';
import { TodayView } from '../views/TodayView';
import { UpcomingView } from '../views/UpcomingView';
import { AllTasksView } from '../views/AllTasksView';
import { SearchView } from '../views/SearchView';
import { KanbanView } from '../views/KanbanView';
import { ProjectView } from '../views/ProjectView';
import { TagView } from '../views/TagView';
import { TaskForm } from '../tasks/TaskForm';
import { TaskDetail } from '../tasks/TaskDetail';
import { SettingsPanel } from '../settings/SettingsPanel';
import { QuickAdd } from '../ui/QuickAdd';

function MainContent() {
  const activeView = useStore((s) => s.activeView);

  if (activeView === 'today') return <TodayView />;
  if (activeView === 'upcoming') return <UpcomingView />;
  if (activeView === 'all') return <AllTasksView />;
  if (activeView === 'search') return <SearchView />;
  if (activeView === 'kanban') return <KanbanView />;
  if (typeof activeView === 'object' && activeView.type === 'project')
    return <ProjectView id={activeView.id} />;
  if (typeof activeView === 'object' && activeView.type === 'tag')
    return <TagView id={activeView.id} />;
  return null;
}

export function AppLayout() {
  const { showTaskForm, closeTaskForm, selectedTaskId, selectTask, showSettings } = useStore();

  return (
    <div className="flex h-screen bg-[var(--bg)] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <MainContent />
          </main>

          {/* Task detail panel */}
          {selectedTaskId && (
            <aside className="w-96 border-l border-[var(--border)] overflow-y-auto shrink-0">
              <TaskDetail
                taskId={selectedTaskId}
                onClose={() => selectTask(null)}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Modals */}
      <TaskForm open={showTaskForm} onClose={closeTaskForm} />
      {showSettings && <SettingsPanel />}
      <QuickAdd />
    </div>
  );
}
