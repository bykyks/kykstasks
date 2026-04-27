import { exportJsonData, exportCsvData, importJsonData } from './db';

const LOCAL_BACKUP_KEY = 'kykstasks-local-backup';

export async function saveLocalBackup(): Promise<void> {
  try {
    const data = await exportJsonData();
    localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify({ data, savedAt: new Date().toISOString() }));
  } catch {
    // silently ignore
  }
}

export function hasLocalBackup(): { savedAt: string } | null {
  try {
    const raw = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.savedAt ? { savedAt: parsed.savedAt } : null;
  } catch {
    return null;
  }
}

export async function restoreLocalBackup(): Promise<boolean> {
  try {
    const raw = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (!raw) return false;
    const { data } = JSON.parse(raw);
    await importJsonData(data);
    return true;
  } catch {
    return false;
  }
}

export async function handleExportJson(): Promise<void> {
  const data = await exportJsonData();
  downloadBlob(data, `kykstasks-backup-${today()}.json`, 'application/json');
}

export async function handleExportCsv(): Promise<void> {
  const data = await exportCsvData();
  downloadBlob(data, `kykstasks-${today()}.csv`, 'text/csv');
}

export async function handleImportJson(): Promise<boolean> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve(false); return; }
      try {
        const text = await file.text();
        await importJsonData(text);
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    input.click();
  });
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function downloadBlob(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
