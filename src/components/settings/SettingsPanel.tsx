import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Upload, Database, LogOut, Bell, BellOff, BellRing, HardDriveDownload } from 'lucide-react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import type { Settings, Theme } from '../../types';
import { handleExportJson, handleExportCsv, handleImportJson, hasLocalBackup, restoreLocalBackup } from '../../lib/export';
import { ensureNotificationPermission, sendDailyDigest } from '../../lib/notifications';

export function SettingsPanel() {
  const { settings, saveSettings, toggleSettings, loadAll } = useStore();
  const [local, setLocal] = useState<Settings | null>(settings);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    'Notification' in window ? Notification.permission : 'unsupported',
  );
  const [digestTesting, setDigestTesting] = useState(false);
  const [localBackupInfo, setLocalBackupInfo] = useState(() => hasLocalBackup());
  const [restoreMsg, setRestoreMsg] = useState('');

  useEffect(() => setLocal(settings), [settings]);

  if (!local) return null;

  const update = (patch: Partial<Settings>) => setLocal((s) => s ? { ...s, ...patch } : s);

  const handleSave = async () => {
    if (!local) return;
    await saveSettings(local);
    toggleSettings();
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const ok = await handleImportJson();
      if (ok) {
        await loadAll();
        setImportMsg('Importation réussie !');
        setTimeout(() => setImportMsg(''), 3000);
      }
    } catch {
      setImportMsg("Échec de l'importation — fichier invalide");
      setTimeout(() => setImportMsg(''), 3000);
    }
    setImporting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleEnableNotifications = async () => {
    const granted = await ensureNotificationPermission();
    setNotifPermission(granted ? 'granted' : Notification.permission);
  };

  const handleTestDigest = async () => {
    setDigestTesting(true);
    await sendDailyDigest();
    setDigestTesting(false);
  };

  const handleRestoreBackup = async () => {
    const ok = await restoreLocalBackup();
    if (ok) {
      await loadAll();
      setRestoreMsg('Sauvegarde restaurée !');
    } else {
      setRestoreMsg('Échec de la restauration');
    }
    setTimeout(() => setRestoreMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={toggleSettings}
      />
      <motion.aside
        className="relative ml-auto w-[480px] h-full bg-[var(--surface)] border-l border-[var(--border)]
                   flex flex-col shadow-2xl overflow-hidden"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Paramètres</h2>
          <Button variant="ghost" size="icon" onClick={toggleSettings}>
            <X size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Theme */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Apparence
            </h3>
            <div>
              <label className="text-sm text-[var(--text-primary)] block mb-2">Thème</label>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => update({ theme: t })}
                    className={`flex-1 py-1.5 rounded-lg text-sm border transition-colors ${
                      local.theme === t
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                        : 'border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {t === 'light' ? 'Clair' : t === 'dark' ? 'Sombre' : 'Système'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Notifications
            </h3>

            {/* Permission status */}
            {notifPermission === 'unsupported' ? (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <BellOff size={14} />
                <span>Notifications non supportées par ce navigateur</span>
              </div>
            ) : notifPermission === 'granted' ? (
              <div className="flex items-center gap-2 text-xs text-green-500">
                <Bell size={14} />
                <span>Notifications activées</span>
              </div>
            ) : notifPermission === 'denied' ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-red-500">
                  <BellOff size={14} />
                  <span>Notifications bloquées par le navigateur</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Autorisez les notifications dans les paramètres de votre navigateur pour ce site.
                </p>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={handleEnableNotifications}
              >
                <BellRing size={14} />
                Activer les notifications
              </Button>
            )}

            <div>
              <label className="text-sm text-[var(--text-primary)] block mb-2">
                Rappel par défaut
              </label>
              <select
                value={local.reminder_default}
                onChange={(e) => update({ reminder_default: Number(e.target.value) })}
                className="w-full text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                           rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none"
              >
                {[5, 15, 30, 60, 1440].map((m) => (
                  <option key={m} value={m}>
                    {m < 60 ? `${m} min` : m === 60 ? '1 heure' : '1 jour'} avant
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => update({ daily_digest_enabled: !local.daily_digest_enabled })}
                className={`w-10 h-5.5 rounded-full relative transition-colors ${
                  local.daily_digest_enabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                    local.daily_digest_enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm text-[var(--text-primary)]">Résumé quotidien</span>
            </label>
            {local.daily_digest_enabled && (
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-[var(--text-secondary)] block mb-1.5">
                    Heure du résumé
                  </label>
                  <input
                    type="time"
                    value={local.daily_digest_time}
                    onChange={(e) => update({ daily_digest_time: e.target.value })}
                    className="text-sm bg-[var(--surface-hover)] border border-[var(--border)]
                               rounded-lg px-3 py-1.5 text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-2"
                  onClick={handleTestDigest}
                  disabled={digestTesting || notifPermission !== 'granted'}
                >
                  <Bell size={14} />
                  {digestTesting ? 'Envoi…' : 'Tester le résumé maintenant'}
                </Button>
              </div>
            )}
          </section>

          {/* Data */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Données
            </h3>

            {/* Auto-backup toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => update({ backup_enabled: !local.backup_enabled })}
                className={`w-10 h-5.5 rounded-full relative transition-colors ${
                  local.backup_enabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                    local.backup_enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm text-[var(--text-primary)]">Sauvegarde locale auto</span>
            </label>
            {local.backup_enabled && (
              <p className="text-xs text-[var(--text-muted)]">
                Sauvegarde automatique dans votre navigateur après chaque modification.
                {localBackupInfo && (
                  <> Dernière : {new Date(localBackupInfo.savedAt).toLocaleString('fr-FR')}.</>
                )}
              </p>
            )}
            {localBackupInfo && (
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={handleRestoreBackup}
              >
                <HardDriveDownload size={14} />
                Restaurer depuis sauvegarde locale
              </Button>
            )}
            {restoreMsg && (
              <p className={`text-xs ${restoreMsg.includes('Échec') ? 'text-red-500' : 'text-green-500'}`}>
                {restoreMsg}
              </p>
            )}

            <div className="space-y-2 pt-1">
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={handleExportJson}
              >
                <Download size={14} />
                Exporter en JSON
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={handleExportCsv}
              >
                <Database size={14} />
                Exporter en CSV
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={handleImport}
                disabled={importing}
              >
                <Upload size={14} />
                Importer depuis JSON
              </Button>
              {importMsg && (
                <p className={`text-xs ${importMsg.includes('fail') || importMsg.includes('Échec') ? 'text-red-500' : 'text-green-500'}`}>
                  {importMsg}
                </p>
              )}
            </div>
          </section>

          {/* Keyboard shortcuts */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Raccourcis clavier
            </h3>
            <div className="space-y-1.5 text-sm">
              {[
                ['n', 'Nouvelle tâche'],
                ['⌘K', 'Ajout rapide'],
                ['⌘,', 'Paramètres'],
                ['1', "Vue Aujourd'hui"],
                ['2', 'Vue À venir'],
                ['3', 'Toutes les tâches'],
                ['4', 'Kanban'],
                ['/', 'Rechercher'],
                ['Esc', 'Fermer / désélectionner'],
                ['Del', 'Supprimer la tâche sélectionnée'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">{label}</span>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] font-mono text-xs text-[var(--text-primary)]">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </section>

          {/* Account */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              Compte
            </h3>
            <Button
              variant="danger"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Se déconnecter
            </Button>
          </section>
        </div>

        <div className="px-5 py-4 border-t border-[var(--border)] flex gap-3">
          <Button variant="ghost" onClick={toggleSettings} className="flex-1">
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">
            Enregistrer
          </Button>
        </div>
      </motion.aside>
    </div>
  );
}
