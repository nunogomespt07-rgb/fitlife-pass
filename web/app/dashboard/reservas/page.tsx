"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import GlassCard from "../../components/ui/GlassCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import type { UnifiedReservation } from "@/lib/unifiedReservations";
import { canCancelReservation, isGymQrExpired, getReservationStatus } from "@/lib/unifiedReservations";

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
}

export default function DashboardReservasPage() {
  const { reservations, cancelReservation, monthlyCancellationCount, monthlyCancellationLimit } = useMockReservations();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const proximas = useMemo(
    () =>
      reservations.filter((r) => {
        if (r.status !== "confirmed") return false;
        if (r.type === "gym") return !isGymQrExpired(r);
        return r.date >= todayYMD();
      }),
    [reservations]
  );

  const passadas = useMemo(
    () =>
      reservations.filter(
        (r) =>
          r.status === "completed" ||
          r.status === "expired" ||
          r.status === "used" ||
          r.status === "no_show" ||
          (r.status === "confirmed" && r.type === "gym" && isGymQrExpired(r)) ||
          (r.status === "confirmed" && r.type !== "gym" && r.date < todayYMD())
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
    setCancelError(null);
    const result = cancelReservation(cancelId);
    setCancelId(null);
    if (result.success) {
      setSuccessMessage("Reserva cancelada com sucesso");
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      setCancelError(result.error ?? "Não foi possível cancelar.");
      setTimeout(() => setCancelError(null), 5000);
    }
  }

  function renderCard(r: UnifiedReservation, showCancel: boolean) {
    const isRestaurant = r.type === "restaurant";
    const isGym = r.type === "gym";
    const status = getReservationStatus(r);
    const canCancel = showCancel && canCancelReservation(r);
    return (
      <GlassCard
        key={r.id}
        variant="app"
        padding="lg"
        className="transition duration-[180ms] hover:translate-y-[-2px]"
      >
        <p className="app-card-title text-white">{r.partnerName}</p>
        <p className="mt-1 text-[15px] text-white/90">
          {formatDate(r.date)} — {r.time}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-white/65">
          {isGym
            ? "Acesso ginásio"
            : isRestaurant
              ? r.bookingMode === "credits"
                ? "Reserva com créditos"
                : "Reserva FitLife Pass — desconto"
              : "Reserva de atividade"}
        </p>
        {isGym && status === "expired" && (
          <span className="mt-2 inline-block rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-200">
            Expirada
          </span>
        )}
        {status === "no_show" && (
          <>
            <span className="mt-2 inline-block rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-200">
              Não compareceste
            </span>
            <p className="mt-2 text-xs text-white/60">
              Não compareceste à reserva. Os créditos da reserva foram debitados.
            </p>
          </>
        )}
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
          <p className="mt-1 text-xs text-white/65">
            {r.creditsUsed} crédito{r.creditsUsed !== 1 ? "s" : ""}
          </p>
        )}
        {showCancel && (
          canCancel ? (
            <button
              type="button"
              onClick={() => handleCancelClick(r.id)}
              className="mt-4 app-btn-secondary rounded-xl px-4 py-2.5 text-sm font-medium"
            >
              Cancelar reserva
            </button>
          ) : !isGym ? (
            <p className="mt-4 text-xs text-white/55">
              Não é possível cancelar com menos de 6 horas de antecedência.
            </p>
          ) : null
        )}
      </GlassCard>
    );
  }

  return (
    <div className="text-white font-sans min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:px-6 lg:px-10">
        <h1 className="app-hero-title text-white">
          Reservas
        </h1>
        <p className="mt-3 text-[15px] text-white/65">
          As tuas reservas ativas e histórico.
        </p>
        <p className="mt-1 text-sm text-white/55">
          Cancelamentos este mês: {monthlyCancellationCount}/{monthlyCancellationLimit}
        </p>

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3.5 text-sm text-emerald-100">
            {successMessage}
          </div>
        )}

        {/* Próximas */}
        <section className="mt-10">
          <h2 className="app-section-title mb-4 text-white/90">
            Próximas
          </h2>
          {proximas.length === 0 ? (
            <GlassCard
              variant="app"
              padding="lg"
              className="text-center text-white/65"
            >
              <p className="text-[15px]">Não tens reservas futuras.</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {proximas.map((r) => renderCard(r, true))}
            </div>
          )}
        </section>

        {/* Passadas */}
        <section className="mt-12">
          <h2 className="app-section-title mb-4 text-white/90">
            Passadas
          </h2>
          {passadas.length === 0 ? (
            <GlassCard
              variant="app"
              padding="lg"
              className="text-center text-white/60"
            >
              <p className="text-[15px]">Ainda não há reservas passadas.</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {passadas.map((r) => renderCard(r, false))}
            </div>
          )}
        </section>

        {/* Canceladas */}
        <section className="mt-12">
          <h2 className="app-section-title mb-4 text-white/90">
            Canceladas
          </h2>
          {canceladas.length === 0 ? (
            <GlassCard
              variant="app"
              padding="lg"
              className="text-center text-white/60"
            >
              <p className="text-[15px]">Nenhuma reserva cancelada.</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {canceladas.map((r) => (
                <GlassCard
                  key={r.id}
                  variant="app"
                  padding="lg"
                  className="opacity-90"
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
            variant="app"
            padding="lg"
            className="mt-10 text-center"
          >
            <p className="app-card-title text-white">Ainda não tens reservas</p>
            <p className="mt-2 text-[15px] text-white/65">
              Reserva atividades em Atividades ou uma mesa em Healthy Food.
            </p>
            <Link href="/activities">
              <PrimaryButton variant="appPrimary" className="mt-6">
                Explorar atividades
              </PrimaryButton>
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
            className="absolute inset-0 bg-[#070f2b]/85 backdrop-blur-sm"
            onClick={() => { setCancelId(null); setCancelError(null); }}
            aria-hidden
          />
          <div
            className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.06] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            }}
          >
            <h2 id="cancel-reservation-title" className="app-section-title text-white">
              Cancelar esta reserva?
            </h2>
            {cancelError && (
              <p className="mt-2 text-sm text-amber-200">{cancelError}</p>
            )}
            <p className="mt-2 text-[15px] text-white/65">
              Não é possível cancelar com menos de 6 horas de antecedência. Com 12h ou mais, os créditos são devolvidos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-100 transition hover:bg-red-500/30 active:scale-[0.98]"
              >
                Confirmar cancelamento
              </button>
              <button
                type="button"
                onClick={() => { setCancelId(null); setCancelError(null); }}
                className="app-btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
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
