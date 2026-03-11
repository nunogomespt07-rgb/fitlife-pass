"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getMe, type MeUser } from "@/lib/api";
import { getStoredUser, getStoredUserDisplayName } from "@/lib/storedUser";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import GlassCard from "@/app/components/ui/GlassCard";
import DashboardCard from "@/app/components/ui/DashboardCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import SectionHeader from "@/app/components/ui/SectionHeader";
import ReservationQRModal from "@/app/components/ui/ReservationQRModal";
import type { UnifiedReservation } from "@/lib/unifiedReservations";

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    reservations,
    activeReservationCount,
    credits,
    cancelReservation,
    completeReservation,
    clearHistory,
  } = useMockReservations();
  const [successMessage, setSuccessMessage] = useState("");
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);
  const [qrModalReservation, setQrModalReservation] = useState<UnifiedReservation | null>(null);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  const activeReservations = useMemo(
    () =>
      reservations.filter(
        (r) => r.status === "confirmed" && r.date >= todayYMD()
      ),
    [reservations]
  );

  const history = useMemo(
    () =>
      reservations.filter(
        (r) =>
          r.status === "completed" ||
          r.status === "cancelled" ||
          (r.status === "confirmed" && r.date < todayYMD())
      ),
    [reservations]
  );

  useEffect(() => {
    if (!showClearHistoryConfirm) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowClearHistoryConfirm(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showClearHistoryConfirm]);

  useEffect(() => {
    let alive = true;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (session?.user && !token) {
      const nameFromSession = session.user.name?.trim();
      setUser({
        _id: (session.user as { id?: string }).id ?? session.user.email ?? "",
        name: nameFromSession && nameFromSession.length > 0 ? nameFromSession : "",
        email: session.user.email ?? "",
      });
      setLoading(false);
      return;
    }
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const userData = await getMe(token);
        if (!alive) return;
        setUser(userData);
        try {
          const stored = getStoredUser();
          localStorage.setItem(
            "fitlife-user",
            JSON.stringify({
              id: userData._id,
              name: userData.name,
              email: userData.email,
              city: stored?.city ?? null,
              phone: stored?.phone ?? null,
              subscriptionPlanId: stored?.subscriptionPlanId ?? null,
              subscriptionPlanName: stored?.subscriptionPlanName ?? null,
            })
          );
        } catch {}
      } catch {
        const stored = getStoredUser();
        if (!alive) return;
        if (stored?.name) {
          setUser({
            _id: stored.id,
            name: stored.name,
            email: stored.email,
          });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [session]);

  function handleCancelReservation(id: string) {
    const r = reservations.find((x) => x.id === id);
    if (!r) return;
    setCancelLoadingId(id);
    setSuccessMessage("");
    cancelReservation(id);
    const refundMsg =
      r.type === "activity" && r.creditsUsed > 0
        ? ` ${r.creditsUsed} crédito(s) devolvido(s).`
        : "";
    setSuccessMessage(`Reserva cancelada com sucesso.${refundMsg}`);
    setTimeout(() => setSuccessMessage(""), 5000);
    setCancelLoadingId(null);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-8 pb-16">
        <p className="text-white/60">A carregar…</p>
      </div>
    );
  }

  const displayName = getStoredUserDisplayName() || user?.name?.trim().split(/\s+/)[0] || "";
  const firstName = displayName || "tu";
  const hasPlan = Boolean(getStoredUser()?.subscriptionPlanId);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 pt-2 sm:px-6 lg:px-10">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
          FitLife Pass · Área pessoal
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Olá, {firstName}
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Acede rapidamente às tuas reservas, créditos e histórico na tua conta FitLife Pass.
        </p>
      </header>

        {/* Resumo principal */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          <DashboardCard
            title="Créditos"
            subtitle="Saldo disponível"
            className="bg-[radial-gradient(circle_at_0%_0%,rgba(96,165,250,0.32),transparent_55%),linear-gradient(135deg,#1D4ED8,#2563EB)] border-white/[0.22] shadow-[0_26px_70px_rgba(37,99,235,0.55)]"
          >
            <p className="text-4xl font-semibold text-white">
              {credits}
            </p>
            <p className="mt-2 text-sm text-white/60">créditos restantes</p>
            {credits === 0 && (
              <p className="mt-3 text-sm text-white/80">
                Sem plano ativo. Escolhe um plano para começar a usar créditos.
              </p>
            )}
            {!hasPlan && (
              <Link href="/dashboard/pagamentos#planos" className="mt-4 block">
                <span className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-white/15 hover:border-white/30">
                  Ver planos
                </span>
              </Link>
            )}
            <Link href="/dashboard/creditos">
              <span className="mt-4 inline-flex items-center text-xs font-medium text-blue-100 underline-offset-2 hover:underline">
                Ver detalhes de créditos →
              </span>
            </Link>
          </DashboardCard>

          <DashboardCard
            title="Reservas ativas"
            subtitle="Próximas atividades"
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.75)] transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-xl"
          >
            <p className="text-3xl font-semibold text-white">
              {activeReservationCount}
            </p>
            <p className="mt-1 text-sm text-white/70">reserva(s)</p>
            <Link href="/dashboard/reservas">
              <span className="mt-4 inline-flex items-center text-xs font-medium text-blue-100 underline-offset-2 hover:underline">
                Ver todas as reservas →
              </span>
            </Link>
          </DashboardCard>
        </div>

        {/* Minhas reservas recentes */}
        <SectionHeader
          title="Minhas reservas"
          subtitle="Próximas atividades e reservas de mesa."
          className="mt-20"
        />

        {successMessage && (
          <div className="mt-6 rounded-[28px] border border-emerald-400/30 bg-emerald-500/10 px-5 py-3.5 text-sm text-emerald-100">
            {successMessage}
          </div>
        )}

        {activeReservations.length === 0 ? (
          <GlassCard
            variant="dark"
            padding="lg"
            className="mt-8 flex min-h-[200px] flex-col items-center justify-center text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.75)]"
          >
            <p className="text-sm font-medium text-white/80">Sem reservas ativas</p>
            <p className="mt-2 text-sm text-white/55">Ainda não tens reservas. Explora atividades e faz a tua primeira reserva.</p>
            <Link href="/activities">
              <PrimaryButton variant="secondary" className="mt-6 py-3.5">
                Ver atividades →
              </PrimaryButton>
            </Link>
          </GlassCard>
        ) : (
          <ul className="mt-8 space-y-5">
            {activeReservations.map((r) => (
              <li key={r.id}>
                <GlassCard
                  variant="dark"
                  padding="md"
                  hover
                  active
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.75)] transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-xl"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {r.type === "activity" && r.categorySlug && r.activityId ? (
                        <Link
                          href={`/activities/categorias/${r.categorySlug}/parceiros/${r.partnerId}/atividades/${r.activityId}`}
                          className="block"
                        >
                          <p className="font-semibold text-white">
                            {r.activityTitle ?? r.partnerName}
                          </p>
                          <p className="mt-1 text-xs text-white/60">
                            {r.partnerName}
                            {r.location ? ` · ${r.location}` : ""}
                          </p>
                          <p className="mt-0.5 text-xs text-white/50">
                            Data: {r.date} · {r.time}
                            {r.people > 0 && (
                              <span> · {r.people} {r.people === 1 ? "pessoa" : "pessoas"}</span>
                            )}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <p className="font-semibold text-white">
                            {r.type === "activity"
                              ? r.activityTitle ?? r.partnerName
                              : r.partnerName}
                          </p>
                          <p className="mt-1 text-xs text-white/60">
                            {r.partnerName}
                            {r.type === "activity" && r.location ? ` · ${r.location}` : ""}
                          </p>
                          <p className="mt-0.5 text-xs text-white/50">
                            Data: {r.date} · {r.time}
                            {r.people > 0 && (
                              <span> · {r.people} {r.people === 1 ? "pessoa" : "pessoas"}</span>
                            )}
                          </p>
                        </>
                      )}
                    </div>
                    <span className="rounded-full bg-white/[0.12] px-3 py-1.5 text-xs font-medium text-white">
                      {r.type === "activity"
                        ? `${r.creditsUsed} créditos`
                        : "Reserva FitLife Pass"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {r.type === "activity" && (
                      <button
                        type="button"
                        onClick={() => setQrModalReservation(r)}
                        className="rounded-xl border border-white/[0.2] bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.12] hover:text-white active:scale-[0.98]"
                      >
                        Ver QR Code
                      </button>
                    )}
                    {r.type === "activity" && (
                      <button
                        type="button"
                        onClick={() => {
                          completeReservation(r.id);
                          setSuccessMessage(
                            `Reserva "${r.activityTitle ?? r.partnerName}" marcada como utilizada.`
                          );
                          setTimeout(() => setSuccessMessage(""), 4000);
                        }}
                        className="rounded-xl border border-white/[0.2] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.1] hover:text-white active:scale-[0.98]"
                      >
                        Marcar como utilizada
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCancelReservation(r.id);
                      }}
                      disabled={cancelLoadingId === r.id}
                      className="rounded-xl border border-white/[0.2] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.1] hover:text-white disabled:opacity-60 active:scale-[0.98]"
                    >
                      {cancelLoadingId === r.id ? "A cancelar…" : "Cancelar reserva"}
                    </button>
                  </div>
                </GlassCard>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-20 flex flex-wrap items-start justify-between gap-4">
          <SectionHeader
            title="Histórico de reservas"
            subtitle="Reservas passadas, concluídas ou canceladas."
            className="flex-1 min-w-0"
          />
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearHistoryConfirm(true)}
              className="rounded-xl border border-white/[0.15] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.1] hover:text-white active:scale-[0.98] shrink-0"
            >
              Limpar histórico
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <GlassCard
            variant="dark"
            padding="lg"
            className="mt-8 flex min-h-[140px] flex-col items-center justify-center text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <p className="text-sm font-medium text-white/80">Ainda não tens histórico de reservas.</p>
            <p className="mt-2 text-sm text-white/55">As tuas reservas passadas, concluídas ou canceladas aparecerão aqui.</p>
          </GlassCard>
        ) : (
          <ul className="mt-8 space-y-4">
            {history.map((h) => (
              <li key={h.id}>
                <GlassCard
                  variant="dark"
                  padding="md"
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {h.type === "activity"
                          ? h.activityTitle ?? h.partnerName
                          : h.partnerName}
                      </p>
                      <p className="mt-1 text-xs text-white/60">{h.partnerName}</p>
                      <p className="mt-0.5 text-xs text-white/50">
                        {h.date} · {h.time}
                        {h.type === "activity" && h.creditsUsed > 0
                          ? ` · ${h.creditsUsed} créditos`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        h.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-200"
                          : h.status === "cancelled"
                            ? "bg-red-500/20 text-red-200"
                            : "bg-amber-500/20 text-amber-200"
                      }`}
                    >
                      {h.status === "completed"
                        ? "concluída"
                        : h.status === "cancelled"
                          ? "cancelada"
                          : "expirada"}
                    </span>
                  </div>
                </GlassCard>
              </li>
            ))}
          </ul>
        )}

        {qrModalReservation && (
          <ReservationQRModal
            reservation={qrModalReservation}
            onClose={() => setQrModalReservation(null)}
          />
        )}

        {showClearHistoryConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-history-title"
          >
            <div
              className="absolute inset-0 bg-[#0b1e4d]/80 backdrop-blur-sm"
              onClick={() => setShowClearHistoryConfirm(false)}
              aria-hidden
            />
            <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-[rgba(11,30,77,0.95)] p-6 shadow-2xl backdrop-blur-xl">
              <h2 id="clear-history-title" className="text-xl font-semibold tracking-tight text-white">
                Limpar histórico?
              </h2>
              <p className="mt-3 text-sm text-white/80">
                Serão removidas apenas as entradas do histórico de reservas. As reservas ativas e os teus créditos não são alterados.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearHistory();
                    setShowClearHistoryConfirm(false);
                  }}
                  className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-100 transition hover:bg-red-500/30"
                >
                  Sim, limpar histórico
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearHistoryConfirm(false)}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
