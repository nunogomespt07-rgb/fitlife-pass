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
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6 lg:px-10">
        <div className="h-10 w-48 rounded-lg bg-white/10 skeleton-shimmer" />
        <div className="mt-6 h-4 w-full max-w-md rounded bg-white/10 skeleton-shimmer" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="h-44 rounded-2xl bg-white/10 skeleton-shimmer" />
          <div className="h-44 rounded-2xl bg-white/10 skeleton-shimmer" />
        </div>
        <div className="mt-12 h-8 w-64 rounded bg-white/10 skeleton-shimmer" />
        <div className="mt-6 h-32 rounded-2xl bg-white/10 skeleton-shimmer" />
      </div>
    );
  }

  const displayName = getStoredUserDisplayName() || user?.name?.trim().split(/\s+/)[0] || "";
  const firstName = displayName || "tu";
  const hasPlan = Boolean(getStoredUser()?.subscriptionPlanId);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6 sm:pt-10 lg:px-10">
      <header className="mb-8 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
          FitLife Pass · Área pessoal
        </p>
        <h1 className="app-hero-title mt-4 text-white sm:mt-5">
          Olá, {firstName} 👋
        </h1>
        <p className="mt-3 text-base leading-relaxed text-white/65">
          Acede rapidamente às tuas reservas, créditos e histórico na tua conta FitLife Pass.
        </p>
      </header>

        {/* Primary CTA */}
        <div className="mt-8 sm:mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/activities" className="block">
              <PrimaryButton variant="appPrimary" className="w-full sm:w-auto min-w-[240px] py-4 text-base font-semibold">
                Explorar atividades
              </PrimaryButton>
            </Link>
            <Link href="/dashboard/rotina" className="block">
              <PrimaryButton variant="appSecondary" className="w-full sm:w-auto min-w-[240px] py-4 text-base font-semibold">
                Gerar rotina semanal
              </PrimaryButton>
            </Link>
          </div>
          <p className="mt-2 text-sm text-white/75">ou <Link href="/dashboard/reservas" className="font-medium text-white/90 underline-offset-2 hover:underline">ver as minhas reservas</Link></p>
        </div>

        {/* Resumo principal */}
        <div className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2">
          <DashboardCard
            hero
            title="Créditos"
            subtitle="Saldo disponível"
            className="relative overflow-hidden"
          >
            <p className="relative text-[48px] font-bold tracking-tight text-white tabular-nums sm:text-[56px]">
              {credits}
            </p>
            <p className="relative mt-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/90">
              CRÉDITOS DISPONÍVEIS
            </p>
            {credits === 0 && (
              <p className="relative mt-3 text-base text-white/90">
                Sem plano ativo. Escolhe um plano para começar a usar créditos.
              </p>
            )}
            {!hasPlan && (
              <Link href="/dashboard/pagamentos#planos" className="mt-4 block">
                <span className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-[180ms] hover:bg-white/15 hover:border-white/30 active:scale-[0.98]">
                  Ver planos
                </span>
              </Link>
            )}
            <Link href="/dashboard/creditos">
              <span className="mt-4 inline-flex items-center text-sm font-medium text-white/90 underline-offset-2 hover:underline">
                Ver atividade →
              </span>
            </Link>
          </DashboardCard>

          <DashboardCard
            title="Reservas ativas"
            subtitle="Próximas atividades"
          >
            <p className="text-3xl font-semibold text-white">
              {activeReservationCount}
            </p>
            <p className="mt-1 text-base text-white/65">reserva(s)</p>
            <Link href="/dashboard/reservas">
              <span className="mt-4 inline-flex items-center text-sm font-medium text-white/90 underline-offset-2 hover:underline">
                Ver todas as reservas →
              </span>
            </Link>
          </DashboardCard>
        </div>

        {/* Minhas reservas recentes */}
        <SectionHeader
          title="Minhas reservas"
          subtitle="Próximas atividades e reservas de mesa."
          variant="app"
          className="mt-12 sm:mt-14"
        />

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3.5 text-base text-emerald-100">
            {successMessage}
          </div>
        )}

        {activeReservations.length === 0 ? (
          <GlassCard
            variant="app"
            padding="lg"
            className="mt-8 flex min-h-[200px] flex-col items-center justify-center text-center"
          >
            <p className="app-card-title text-white">Ainda não tens reservas ativas.</p>
            <p className="mt-3 text-[15px] text-white/75 max-w-sm">Explora atividades e reserva o teu próximo treino.</p>
            <Link href="/activities" className="mt-5">
              <PrimaryButton variant="appPrimary" className="min-w-[200px]">
                Explorar atividades
              </PrimaryButton>
            </Link>
          </GlassCard>
        ) : (
          <ul className="mt-8 space-y-5">
            {activeReservations.map((r) => (
              <li key={r.id}>
                <GlassCard
                  variant="app"
                  padding="md"
                  hover
                  active
                  activityStyle
                  className="flex flex-col gap-3"
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
                          <p className="mt-1 text-[13px] text-white/65">
                            {r.partnerName}
                            {r.location ? ` · ${r.location}` : ""}
                          </p>
                          <p className="mt-0.5 text-xs text-white/55">
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
                        className="app-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold transition"
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
                        className="app-btn-secondary rounded-xl px-4 py-2.5 text-sm font-medium"
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
                      className="app-btn-secondary rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                    >
                      {cancelLoadingId === r.id ? "A cancelar…" : "Cancelar reserva"}
                    </button>
                  </div>
                </GlassCard>
              </li>
            ))}
          </ul>
        )}

        {/* Location-ready: Atividades perto de ti (future) */}
        <section className="mt-12 sm:mt-14" aria-label="Atividades perto de ti">
          <h2 className="app-section-title text-white/90">Atividades perto de ti</h2>
          <p className="mt-2 text-[15px] text-white/75 max-w-xl">Em breve poderás ver atividades e parceiros perto da tua localização.</p>
          <Link href="/activities" className="mt-4 inline-block text-sm font-medium text-white/85 underline-offset-2 hover:underline">
            Ver todas as atividades →
          </Link>
        </section>

        <div className="mt-12 sm:mt-14 flex flex-wrap items-start justify-between gap-4">
          <SectionHeader
            title="Histórico de reservas"
            subtitle="Reservas passadas, concluídas ou canceladas."
            variant="app"
            className="flex-1 min-w-0"
          />
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearHistoryConfirm(true)}
              className="app-btn-secondary rounded-xl px-4 py-2.5 text-sm font-medium shrink-0"
            >
              Limpar histórico
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <GlassCard
            variant="app"
            padding="lg"
            className="mt-8 flex min-h-[140px] flex-col items-center justify-center text-center"
          >
            <p className="text-base font-medium text-white/90">Ainda não tens histórico de reservas.</p>
            <p className="mt-2 text-base text-white/65">As tuas reservas passadas, concluídas ou canceladas aparecerão aqui.</p>
          </GlassCard>
        ) : (
          <ul className="mt-8 space-y-4">
            {history.map((h) => (
              <li key={h.id}>
                <GlassCard
                  variant="app"
                  padding="md"
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {h.type === "activity"
                          ? h.activityTitle ?? h.partnerName
                          : h.partnerName}
                      </p>
                      <p className="mt-1 text-[13px] text-white/65">{h.partnerName}</p>
                      <p className="mt-0.5 text-xs text-white/55">
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
              className="absolute inset-0 bg-[#070f2b]/85 backdrop-blur-sm"
              onClick={() => setShowClearHistoryConfirm(false)}
              aria-hidden
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.06] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              }}
            >
              <h2 id="clear-history-title" className="app-section-title text-white">
                Limpar histórico?
              </h2>
              <p className="mt-3 text-base text-white/65">
                Serão removidas apenas as entradas do histórico de reservas. As reservas ativas e os teus créditos não são alterados.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearHistory();
                    setShowClearHistoryConfirm(false);
                  }}
                  className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-100 transition hover:bg-red-500/30 active:scale-[0.98]"
                >
                  Sim, limpar histórico
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearHistoryConfirm(false)}
                  className="app-btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
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
