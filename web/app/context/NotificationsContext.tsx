"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { NotificationItem } from "@/lib/notifications";
import {
  getStoredNotifications,
  setStoredNotifications,
} from "@/lib/notifications";

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setNotifications(getStoredNotifications());
  }, []);

  // Ensure a single welcome notification is created once per browser
  useEffect(() => {
    if (typeof window === "undefined") return;
    const FLAG_KEY = "fitlife-welcome-notification-created";
    const hasFlag = window.localStorage.getItem(FLAG_KEY);
    if (hasFlag) return;

    const existing = getStoredNotifications();
    if (existing.length === 0) {
      const welcome: NotificationItem = {
        id: `welcome-${Date.now()}`,
        title: "Bem-vindo ao FitLife Pass",
        description:
          "Explora atividades perto de ti e usa os teus créditos para reservar a tua primeira experiência.",
        dateTime: new Date().toISOString(),
        read: false,
      };
      const next = [welcome];
      setNotifications(next);
      setStoredNotifications(next);
    }
    window.localStorage.setItem(FLAG_KEY, "1");
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      setStoredNotifications(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      setStoredNotifications(next);
      return next;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      setStoredNotifications(next);
      return next;
    });
  }, []);

  const deleteAllNotifications = useCallback(() => {
    setNotifications([]);
    setStoredNotifications([]);
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
