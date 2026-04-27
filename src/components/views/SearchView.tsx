import React from 'react';
import { useStore } from '../../store';
import { TaskList } from '../tasks/TaskList';

export function SearchView() {
  const { tasks, tags, searchQuery } = useStore();
  const q = searchQuery.toLowerCase().trim();

  const results = tasks.filter((t) => {
    if (!q) return false;
    if (t.title.toLowerCase().includes(q)) return true;
    if (t.notes.toLowerCase().includes(q)) return true;
    const taskTagNames = tags
      .filter((tag) => t.tags.includes(tag.id))
      .map((tag) => tag.name.toLowerCase());
    return taskTagNames.some((name) => name.includes(q));
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {q ? (
        <>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            {results.length} résultat{results.length !== 1 ? 's' : ''} pour "{q}"
          </p>
          <TaskList
            tasks={results}
            draggable={false}
            emptyMessage={`Aucune tâche pour "${q}"`}
          />
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)] text-center py-16">
          Commencez à taper pour rechercher des tâches, notes et étiquettes
        </p>
      )}
    </div>
  );
}
