import { exportJsonData, exportCsvData, importJsonData } from './db';

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
