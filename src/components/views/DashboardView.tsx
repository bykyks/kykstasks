import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react';
import { useStore } from '../../store';
import { PRIORITY_CONFIG } from '../../types';
import { cn, isOverdue, isToday } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAY_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTH_CAP = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, '').trim();
}

function getCalendarDays(month: Date): (Date | null)[] {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startOffset = (first.getDay() + 6) % 7; // Mon=0
  const days: (Date | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(y, m, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export function DashboardView() {
  const { tasks, projects, tags, setView, selectTask, toggleTask, openTaskForm } = useStore();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [userName, setUserName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? '';
      setUserName(email.split('@')[0]);
    });
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const viewDateStr = viewDate.toISOString().slice(0, 10);
  const isViewingToday = viewDateStr === todayStr;

  const shiftDay = (n: number) =>
    setViewDate((d) => { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; });
  const shiftMonth = (n: number) =>
    setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));

  // Tasks avec tâche jour + en retard si aujourd'hui
  const centerTasks = tasks
    .filter((t) => {
      if (t.completed || !t.due_date) return false;
      if (t.due_date === viewDateStr) return true;
      if (isViewingToday && isOverdue(t.due_date) && !isToday(t.due_date)) return true;
      return false;
    })
    .sort((a, b) => {
      if (a.due_time && b.due_time) return a.due_time.localeCompare(b.due_time);
      if (a.due_time) return -1;
      if (b.due_time) return 1;
      return 0;
    });

  // Épinglés = urgent + high, top 4
  const pinnedTasks = tasks
    .filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high'))
    .sort((a, b) => {
      const o = { urgent: 0, high: 1, medium: 2, low: 3 };
      return o[a.priority] - o[b.priority];
    })
    .slice(0, 4);

  // Cette semaine (j+1 à j+7)
  const in7Str = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10); })();
  const weekTasks = tasks
    .filter((t) => !t.completed && t.due_date && t.due_date > todayStr && t.due_date <= in7Str)
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!))
    .slice(0, 7);

  // Projets actifs
  const activeProjects = projects
    .map((p) => ({ ...p, count: tasks.filter((t) => !t.completed && t.project_id === p.id).length }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);

  // Calendrier
  const calDays = getCalendarDays(calMonth);
  const taskDates = new Set(tasks.filter((t) => !t.completed && t.due_date).map((t) => t.due_date!));

  const userInitial = userName ? userName[0].toUpperCase() : '?';

  return (
    <div className="h-full flex overflow-hidden">

      {/* ══ COLONNE GAUCHE ══ */}
      <div className="w-72 shrink-0 border-r border-[var(--border)] overflow-y-auto">
        <div className="p-5 space-y-6">

          {/* Épinglés */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Épinglés</h3>
              <button
                onClick={() => setView('all')}
                className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                Voir tout
              </button>
            </div>

            <div className="space-y-2.5">
              {pinnedTasks.map((task) => {
                const priority = PRIORITY_CONFIG[task.priority];
                const taskTags = tags.filter((t) => task.tags.includes(t.id));
                const project = projects.find((p) => p.id === task.project_id);
                const badge = taskTags[0] ?? (project ? { name: project.name, color: project.color } : null);
                const notes = stripHtml(task.notes ?? '');

                return (
                  <div
                    key={task.id}
                    onClick={() => selectTask(task.id)}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 cursor-pointer
                               hover:border-[var(--accent)]/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar coloré */}
                      <div
                        className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-bold text-white text-sm"
                        style={{ backgroundColor: priority.color }}
                      >
                        {task.priority === 'urgent' ? '!' : '↑'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] leading-snug truncate">
                          {task.title}
                        </p>
                        {task.due_date && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {new Date(task.due_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                            {task.due_time && ` · ${task.due_time.slice(0, 5)}`}
                          </p>
                        )}
                        {badge && (
                          <span
                            className="inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: badge.color }}
                          >
                            {badge.name}
                          </span>
                        )}
                        {notes && (
                          <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2 leading-relaxed">
                            {notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {pinnedTasks.length === 0 && (
                <p className="text-sm text-[var(--text-muted)] px-1">Aucune tâche prioritaire</p>
              )}
            </div>

            <button
              onClick={() => openTaskForm()}
              className="mt-3 w-full flex items-center gap-2 px-4 py-2.5 rounded-xl
                         border-2 border-dashed border-[var(--border)] text-sm font-medium
                         text-[var(--text-muted)] hover:border-[var(--accent)]/50
                         hover:text-[var(--accent)] transition-all"
            >
              <Plus size={15} />
              Nouvelle tâche
            </button>
          </div>

          {/* Mini calendrier */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {MONTH_CAP[calMonth.getMonth()]}, {calMonth.getFullYear()}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => shiftMonth(-1)}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => shiftMonth(1)}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* En-têtes jours */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_SHORT.map((d) => (
                <div key={d} className="text-center text-xs font-bold text-[var(--text-muted)] py-1">
                  {d[0]}
                </div>
              ))}
            </div>

            {/* Grille jours */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {calDays.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const ds = day.toISOString().slice(0, 10);
                const isT = ds === todayStr;
                const isSel = ds === viewDateStr;
                const hasTasks = taskDates.has(ds);
                return (
                  <button
                    key={ds}
                    onClick={() => {
                      setViewDate(new Date(day));
                      setCalMonth(new Date(day.getFullYear(), day.getMonth(), 1));
                    }}
                    className={cn(
                      'relative flex flex-col items-center justify-center w-8 h-8 mx-auto rounded-full text-xs font-semibold transition-all',
                      isSel
                        ? 'bg-[var(--accent)] text-white'
                        : isT
                          ? 'text-[var(--accent)] font-extrabold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]',
                    )}
                  >
                    {day.getDate()}
                    {hasTasks && (
                      <span
                        className={cn(
                          'absolute bottom-0.5 w-1 h-1 rounded-full',
                          isSel ? 'bg-white' : 'bg-[var(--accent)]',
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══ COLONNE CENTRE ══ */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-8 py-6">

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight leading-none">
              Planning du jour
            </h1>
            <div className="flex items-center gap-1.5 mt-2">
              <button
                onClick={() => shiftDay(-1)}
                className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-base font-bold text-[var(--accent)]">
                {DAY_FULL[viewDate.getDay()]} {viewDate.getDate()} {MONTH[viewDate.getMonth()]}
              </span>
              <button
                onClick={() => shiftDay(1)}
                className="p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              {!isViewingToday && (
                <button
                  onClick={() => { setViewDate(new Date()); setCalMonth(new Date()); }}
                  className="ml-1.5 text-xs font-semibold text-[var(--text-muted)]
                             hover:text-[var(--accent)] transition-colors"
                >
                  Aujourd'hui
                </button>
              )}
            </div>
          </div>

          {/* Liste tâches */}
          {centerTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-semibold text-[var(--text-muted)]">
                {isViewingToday ? 'Tout est à jour ! 🎉' : 'Aucune tâche ce jour'}
              </p>
              <button
                onClick={() => openTaskForm()}
                className="mt-3 text-sm font-semibold text-[var(--accent)]
                           hover:text-[var(--accent-hover)] transition-colors"
              >
                + Ajouter une tâche
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-w-xl">
              {centerTasks.map((task, i) => {
                const isAmber = i < 2;
                const isLate = !isToday(task.due_date) && isOverdue(task.due_date);
                const priority = PRIORITY_CONFIG[task.priority];
                const doneCount = task.subtasks.filter((s) => s.completed).length;
                const notes = stripHtml(task.notes ?? '');

                return (
                  <div
                    key={task.id}
                    onClick={() => selectTask(task.id)}
                    className={cn(
                      'rounded-2xl px-5 py-4 cursor-pointer transition-all duration-150 select-none',
                      isAmber
                        ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-md'
                        : 'bg-[var(--surface)] border-2 border-[var(--border)] hover:border-[var(--accent)]/30 hover:shadow-sm',
                    )}
                  >
                    <div className="flex items-start gap-4">

                      {/* Checkbox */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                        className={cn(
                          'mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                          isAmber
                            ? 'border-white/60 hover:border-white hover:bg-white/20'
                            : 'border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface-active)]',
                        )}
                      >
                        {task.completed && (
                          <Check size={12} color={isAmber ? 'white' : 'var(--accent)'} strokeWidth={3} />
                        )}
                      </button>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-bold leading-snug',
                          isAmber
                            ? 'text-white text-base'
                            : isLate
                              ? 'text-red-500 text-sm'
                              : 'text-[var(--text-primary)] text-sm',
                        )}>
                          {task.title}
                        </p>

                        {/* Notes (cards blanches uniquement) */}
                        {!isAmber && notes && (
                          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1 leading-relaxed">
                            {notes}
                          </p>
                        )}

                        {/* Sous-tâches */}
                        {task.subtasks.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {task.subtasks.slice(0, 3).map((sub) => (
                              <div key={sub.id} className="flex items-center gap-2">
                                <span className={cn(
                                  'w-1 h-1 rounded-full shrink-0',
                                  isAmber ? 'bg-white/50' : 'bg-[var(--text-muted)]',
                                )} />
                                <span className={cn(
                                  'text-xs truncate',
                                  sub.completed ? 'line-through opacity-40' : '',
                                  isAmber ? 'text-white/75' : 'text-[var(--text-secondary)]',
                                )}>
                                  {sub.title}
                                </span>
                              </div>
                            ))}
                            {task.subtasks.length > 3 && (
                              <p className={cn('text-xs', isAmber ? 'text-white/50' : 'text-[var(--text-muted)]')}>
                                +{task.subtasks.length - 3} autres · {doneCount}/{task.subtasks.length}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Badge priorité + retard (cards blanches) */}
                        {!isAmber && (
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ color: priority.color, backgroundColor: priority.bgColor }}
                            >
                              {priority.label}
                            </span>
                            {isLate && (
                              <span className="text-xs font-semibold text-red-500">En retard</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Heure */}
                      {task.due_time && (
                        <span className={cn(
                          'text-sm font-bold shrink-0 mt-0.5',
                          isAmber ? 'text-white/90' : 'text-[var(--text-secondary)]',
                        )}>
                          {task.due_time.slice(0, 5)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setView('today')}
                className="w-full text-center text-xs font-semibold text-[var(--accent)]
                           hover:text-[var(--accent-hover)] py-2 transition-colors"
              >
                Voir tout →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══ COLONNE DROITE ══ */}
      <div className="w-72 shrink-0 border-l border-[var(--border)] overflow-y-auto">
        <div className="p-5 space-y-6">

          {/* Profil */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">{userInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--text-primary)] truncate capitalize">
                {userName || 'Utilisateur'}
              </p>
              <button
                onClick={() => useStore.getState().toggleSettings()}
                className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors mt-0.5"
              >
                Mes paramètres
              </button>
            </div>
          </div>

          {/* Cette semaine */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                Cette semaine
              </h3>
              {weekTasks.length > 0 && (
                <button
                  onClick={() => setView('upcoming')}
                  className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Voir tout
                </button>
              )}
            </div>

            {weekTasks.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Rien de prévu</p>
            ) : (
              <div className="space-y-1">
                {weekTasks.map((task) => {
                  const d = new Date(task.due_date! + 'T00:00:00');
                  const dl = DAY_SHORT[(d.getDay() + 6) % 7];
                  const priority = PRIORITY_CONFIG[task.priority];
                  return (
                    <button
                      key={task.id}
                      onClick={() => selectTask(task.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                 hover:bg-[var(--surface-hover)] transition-colors text-left"
                    >
                      <div className="shrink-0 w-9 text-center">
                        <p className="text-xs font-bold text-[var(--accent)] leading-none">{dl}</p>
                        <p className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                          {d.getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {task.title}
                        </p>
                        {task.due_time && (
                          <p className="text-xs text-[var(--text-muted)]">
                            {task.due_time.slice(0, 5)}
                          </p>
                        )}
                      </div>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: priority.color }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Projets actifs */}
          {activeProjects.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                Projets actifs
              </h3>
              <div className="space-y-1">
                {activeProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setView({ type: 'project', id: project.id })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                               hover:bg-[var(--surface-hover)] transition-colors text-left"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="flex-1 text-sm font-medium text-[var(--text-primary)] truncate">
                      {project.name}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--surface-active)] px-2.5 py-0.5 rounded-full">
                      {project.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
