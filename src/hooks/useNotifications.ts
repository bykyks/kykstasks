import { useEffect } from 'react';
import { useStore } from '../store';
import {
  startNotificationPoller,
  stopNotificationPoller,
  sendDailyDigest,
} from '../lib/notifications';

export function useNotifications() {
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    startNotificationPoller();
    return () => stopNotificationPoller();
  }, []);

  useEffect(() => {
    if (!settings?.daily_digest_enabled || !settings.daily_digest_time) return;

    const [h, m] = settings.daily_digest_time.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);

    if (target <= now) target.setDate(target.getDate() + 1);
    const ms = target.getTime() - now.getTime();

    const timer = setTimeout(() => {
      sendDailyDigest();
    }, ms);

    return () => clearTimeout(timer);
  }, [settings?.daily_digest_enabled, settings?.daily_digest_time]);
}
