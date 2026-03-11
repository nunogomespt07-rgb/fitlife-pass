"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import GlassCard from "../../components/ui/GlassCard";
import type { UnifiedReservation } from "@/lib/unifiedReservations";

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
}

export default function DashboardReservasPage() {
  const { reservations, cancelReservation } = useMockReservations();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const proximas = useMemo(
    () =>
      reservations.filter(
        (r) => r.status === "confirmed" && r.date >= todayYMD()
      ),
    [reservations]
  );

  const passadas = useMemo(
    () =>
      reservations.filter(
        (r) =>
          r.status === "completed" ||
          (r.status === "confirmed" && r.date < todayYMD())
      ),
    [reservations]
  );

  const canceladas = useMemo(
    () => reservations.filter((r) => r.status === "cancelled"),
    [reservations]
  );

  function handleCancelClick(id: string) {
    setCancelId(id);
  }

  function handleConfirmCancel() {
    if (!cancelId) return;
    const r = reservations.find((x) => x.id === cancelId);
    cancelReservation(cancelId);
    setCancelId(null);
    setSuccessMessage("Reserva cancelada com sucesso");
    setTimeout(() => setSuccessMessage(null), 5000);
  }

  function renderCard(r: UnifiedReservation, showCancel: boolean) {
    const isRestaurant = r.type === "restaurant";
    return (
      <GlassCard
        key={r.id}
        variant="dark"
        padding="lg"
        className="rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl"
      >
        <p className="font-semibold text-white">{r.partnerName}</p>
        <p className="mt-1 text-white/90">
          {formatDate(r.date)} — {r.time}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/60">
          {isRestaurant
            ? r.bookingMode === "credits"
              ? "Reserva com créditos"
              : "Reserva FitLife Pass — desconto"
            : "Reserva de atividade"}
        </p>
        {isRestaurant && r.bookingMode !== "credits" && r.discountLabel && (
          <p className="mt-1 text-sm text-white/70">{r.discountLabel}</p>
        )}
        {r.people > 0 && (
          <p className="mt-2 text-sm text-white/80">
            {isRestaurant
              ? `Mesa para ${r.people} ${r.people === 1 ? "pessoa" : "pessoas"}`
              : `${r.people} ${r.people === 1 ? "pessoa" : "pessoas"}`}
          </p>
        )}
        {r.creditsUsed > 0 && (
          <p className="mt-1 text-xs text-white/60">
            {r.creditsUsed} crédito{r.creditsUsed !== 1 ? "s" : ""}
          </p>
        )}
        {showCancel && (
          <button
            type="button"
            onClick={() => handleCancelClick(r.id)}
            className="mt-4 rounded-xl border border-white/20 bg-white/6 px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
          >
            Cancelar reserva
          </button>
        )}
      </GlassCard>
    );
  }

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-20 sm:px-6 lg:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Reservas
        </h1>
        <p className="mt-3 text-sm text-white/70">
          As tuas reservas ativas e histórico.
        </p>

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3.5 text-sm text-emerald-100">
            {successMessage}
          </div>
        )}

        {/* Próximas */}
        <section className="mt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/60">
            Próximas
          </h2>
          {proximas.length === 0 ? (
            <GlassCard
              variant="dark"
              padding="lg"
              className="rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl text-center text-white/70"
            >
              <p className="text-sm">Não tens reservas futuras.</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {proximas.map((r) => renderCard(r, true))}
            </div>
          )}
        </section>

        {/* Passadas */}
        <section className="mt-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/60">
            Passadas
          </h2>
          {passadas.length === 0 ? (
            <GlassCard
              variant="dark"
              padding="lg"
              className="rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl text-center text-white/60"
            >
              <p className="text-sm">Ainda não há reservas passadas.</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {passadas.map((r) => renderCard(r, false))}
            </div>
          )}
        </section>

        {/* Canceladas */}
        <section className="mt-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/60">
            Canceladas
          </h2>
          {canceladas.length === 0 ? (
            <GlassCard
              variant="dark"
              padding="lg"
              className="rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl text-center text-white/60"
            >
              <p className="text-sm">Nenhuma reserva cancelada.</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {canceladas.map((r) => (
                <GlassCard
                  key={r.id}
                  variant="dark"
                  padding="lg"
                  className="rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl opacity-90"
                >
                  <p className="font-semibold text-white">{r.partnerName}</p>
                  <p className="mt-1 text-white/80">
                    {formatDate(r.date)} — {r.time}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                    {r.type === "restaurant" ? "Reserva FitLife Pass" : "Reserva de atividade"}
                  </p>
                  {r.people > 0 && (
                    <p className="mt-1 text-sm text-white/60">
                      {r.people} {r.people === 1 ? "pessoa" : "pessoas"}
                    </p>
                  )}
                  <span className="mt-3 inline-block rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-200">
                    Cancelada
                  </span>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {proximas.length === 0 && passadas.length === 0 && canceladas.length === 0 && (
          <GlassCard
            variant="dark"
            padding="lg"
            className="mt-8 rounded-2xl border-white/12 bg-white/5 text-sm text-white/80 backdrop-blur-xl"
          >
            <p className="font-medium text-white">Ainda não tens reservas</p>
            <p className="mt-2 text-sm text-white/70">
              Reserva atividades em Atividades ou uma mesa em Healthy Food.
            </p>
            <Link
              href="/activities"
              className="mt-4 inline-flex rounded-full border border-white/22 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explorar atividades
            </Link>
          </GlassCard>
        )}

        <Link
          href="/dashboard"
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
        >
          ← Voltar ao dashboard
        </Link>
      </div>

      {/* Cancel confirmation modal */}
      {cancelId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-reservation-title"
        >
          <div
            className="absolute inset-0 bg-[#0b1e4d]/80 backdrop-blur-sm"
            onClick={() => setCancelId(null)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/12 bg-white/[0.08] p-6 shadow-2xl backdrop-blur-xl">
            <h2 id="cancel-reservation-title" className="text-lg font-semibold text-white">
              Cancelar esta reserva?
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Se cancelares com pelo menos 12 horas de antecedência, os créditos serão devolvidos.
            </p>
            <p className="mt-1 text-xs text-white/55">
              Cancelamentos com menos de 12 horas não têm reembolso de créditos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-100 transition hover:bg-red-500/30"
              >
                Confirmar cancelamento
              </button>
              <button
                type="button"
                onClick={() => setCancelId(null)}
                className="rounded-xl border border-white/22 bg-white/6 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
