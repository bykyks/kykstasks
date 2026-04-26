import { getDueSoonTasks, getTodayDigest } from './db';

let notificationInterval: ReturnType<typeof setInterval> | null = null;
const firedNotifications = new Set<string>();

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function startNotificationPoller(): Promise<void> {
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  const check = async () => {
    try {
      const dueSoon = await getDueSoonTasks(60);
      for (const task of dueSoon) {
        const key = `${task.id}-${task.due_date}-${task.due_time}`;
        if (!firedNotifications.has(key)) {
          firedNotifications.add(key);
          const timeStr = task.due_time ? ` à ${task.due_time}` : " aujourd'hui";
          new Notification('⏰ Tâche bientôt échue', {
            body: `"${task.title}" arrive à échéance${timeStr}`,
          });
        }
      }
    } catch {
      // silently ignore
    }
  };

  check();
  notificationInterval = setInterval(check, 60_000);
}

export function stopNotificationPoller(): void {
  if (notificationInterval !== null) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}

export async function sendDailyDigest(): Promise<void> {
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  const tasks = await getTodayDigest();
  if (tasks.length === 0) {
    new Notification('✅ Kykstasks — Résumé du jour', {
      body: "Aucune tâche pour aujourd'hui. Bonne journée !",
    });
  } else {
    new Notification(
      `📋 Kykstasks – ${tasks.length} tâche${tasks.length > 1 ? 's' : ''} aujourd'hui`,
      {
        body:
          tasks
            .slice(0, 3)
            .map((t) => `• ${t.title}`)
            .join('\n') + (tasks.length > 3 ? `\n…et ${tasks.length - 3} de plus` : ''),
      },
    );
  }
}
