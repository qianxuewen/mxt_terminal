/**
 * 数据库服务 — Tauri 用 SQLite，浏览器用 localStorage
 */
const IS_TAURI = !!(window as any).__TAURI__ || !!(window as any).__TAURI_IPC__;
const STORAGE_KEY = 'app_settings';

async function tauriInvoke(cmd: string, args?: any): Promise<any> {
  try {
    const { invoke } = await import('@tauri-apps/api/tauri');
    return await invoke(cmd, args || {});
  } catch { return null; }
}

/** 保存完整设置对象 */
export async function saveSettings(settings: Record<string, any>): Promise<void> {
  if (!IS_TAURI) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return;
  }
  // Tauri: 每个顶层 key 存一行
  for (const [key, value] of Object.entries(settings)) {
    try {
      await tauriInvoke('db_set_setting', { key, value: JSON.stringify(value) });
    } catch {}
  }
}

/** 读取完整设置对象 */
export async function loadSettings(): Promise<Record<string, any> | null> {
  if (!IS_TAURI) {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  // Tauri: 从数据库读取所有行，组装为对象
  const rows: [string, string][] | null = await tauriInvoke('db_get_all_settings');
  if (!rows || rows.length === 0) return null;
  const result: Record<string, any> = {};
  for (const [key, value] of rows) {
    if (value) {
      try { result[key] = JSON.parse(value); } catch { result[key] = value; }
    }
  }
  return Object.keys(result).length > 0 ? result : null;
}

/** 删除所有设置 */
export async function clearSettings(): Promise<void> {
  if (!IS_TAURI) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const rows: [string, string][] | null = await tauriInvoke('db_get_all_settings');
  if (rows) {
    for (const [key] of rows) {
      await tauriInvoke('db_delete_setting', { key });
    }
  }
}
