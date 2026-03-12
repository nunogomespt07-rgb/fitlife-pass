/**
 * Notifications: mock events, read/unread, persisted in localStorage.
 */

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  dateTime: string; // ISO or formatted
  read: boolean;
};

const STORAGE_KEY = "fitlife-notifications";

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getStoredNotifications(): NotificationItem[] {
  const data = safeParse<NotificationItem[]>(STORAGE_KEY, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredNotifications(list: NotificationItem[]): void {
  safeSet(STORAGE_KEY, list);
}

export function formatNotificationTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Agora";
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays < 7) return `Há ${diffDays} dia${diffDays !== 1 ? "s" : ""}`;
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}
