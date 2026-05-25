import { demoProgress, legacyStorageKeys, storageKeys } from '@/lib/learning';

export function readStorage<T>(key: string, fallback: T, legacyKey?: string): T {
  try {
    const value = window.localStorage.getItem(key) ?? (legacyKey ? window.localStorage.getItem(legacyKey) : null);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readProgressStorage() {
  const savedProgress = readStorage(storageKeys.progress, demoProgress, legacyStorageKeys.progress);
  const completedCount = Object.values(savedProgress).reduce((total, modules) => total + modules.length, 0);
  return completedCount > 0 ? savedProgress : demoProgress;
}
