"use client";

import Link from "next/link";
import { useNotifications } from "@/app/context/NotificationsContext";
import { formatNotificationTime } from "@/lib/notifications";
import GlassCard from "../../components/ui/GlassCard";

export default function DashboardNotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotifications();

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Notificações
            </h1>
            <p className="mt-3 text-sm text-white/70">
              Atualizações sobre reservas, plano e parceiros.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={deleteAllNotifications}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/15"
              >
                Apagar todas
              </button>
            )}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/15"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>

        <ul className="mt-8 space-y-3">
          {notifications.length === 0 ? (
            <GlassCard
              variant="dark"
              padding="lg"
              className="rounded-2xl border border-white/12 bg-white/5 text-center backdrop-blur-xl"
            >
              <p className="text-sm text-white/70">Ainda não tens notificações.</p>
            </GlassCard>
          ) : (
            notifications.map((n) => (
              <li key={n.id}>
                <GlassCard
                  variant="dark"
                  padding="md"
                  className={`rounded-2xl border backdrop-blur-xl transition-all duration-200 ${
                    n.read
                      ? "border-white/10 bg-white/5"
                      : "border-blue-400/20 bg-white/[0.08]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold ${n.read ? "text-white/90" : "text-white"}`}>
                        {n.title}
                      </p>
                      <p className="mt-1 text-sm text-white/70">{n.description}</p>
                      <p className="mt-2 text-xs text-white/50">
                        {formatNotificationTime(n.dateTime)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!n.read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(n.id)}
                          className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/15"
                        >
                          Marcar como lida
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteNotification(n.id)}
                        className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white/90"
                        aria-label="Apagar notificação"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </li>
            ))
          )}
        </ul>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
        >
          ← Voltar à conta
        </Link>
      </div>
    </div>
  );
}
