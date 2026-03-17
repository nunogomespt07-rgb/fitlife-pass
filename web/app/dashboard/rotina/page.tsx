"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import { getStoredUser } from "@/lib/storedUser";
import {
  getStoredRoutinePreferences,
  type RoutinePreferences,
} from "@/lib/routinePreferences";
import {
  generateRoutineWeek,
  getAlternativesForSession,
  getSessionDayLabel,
  getSessionDisplaySubtitle,
  getSessionDisplayTitle,
  type RoutineSessionCandidate,
  type RoutineWeek,
} from "@/lib/routineEngine";

type BookingResult = {
  ok: boolean;
  message: string;
  perSession: { sessionId: string; ok: boolean; error?: string }[];
};

function formatCredits(n: number): string {
  const x = Math.max(0, Math.floor(n));
  return `${x} crédito${x !== 1 ? "s" : ""}`;
}

export default function DashboardRotinaPage() {
  const router = useRouter();
  const userId = getStoredUser()?.id ?? null;
  const { credits, reservations, addReservation, addGymReservation } = useMockReservations();

  const prefs = useMemo<RoutinePreferences | null>(
    () => getStoredRoutinePreferences(userId),
    [userId]
  );

  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState<RoutineWeek | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<RoutineSessionCandidate[]>([]);
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const remainingAfterPlan = useMemo(() => {
    if (!week) return credits;
    return Math.max(0, credits - week.totalCredits);
  }, [credits, week]);

  useEffect(() => {
    if (!prefs) return;
    setLoading(true);
    setError(null);
    try {
      const w = generateRoutineWeek({ prefs, availableCredits: credits });
      setWeek(w);
      if (w.sessions.length === 0) {
        setError("Não foi possível gerar uma rotina possível com as tuas preferências e saldo atual.");
      }
    } catch {
      setError("Não foi possível gerar a rotina. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }, [prefs, credits]);

  function handleRegenerate() {
    if (!prefs) return;
    setLoading(true);
    setError(null);
    setBookingResult(null);
    try {
      const w = generateRoutineWeek({ prefs, availableCredits: credits });
      setWeek(w);
      if (w.sessions.length === 0) {
        setError("Não foi possível gerar uma rotina possível com as tuas preferências e saldo atual.");
      }
    } catch {
      setError("Não foi possível gerar a rotina. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove(sessionId: string) {
    setWeek((prev) => {
      if (!prev) return prev;
      const nextSessions = prev.sessions.filter((s) => getSessionId(s) !== sessionId);
      const totalCredits = nextSessions.reduce((sum, s) => sum + s.credits, 0);
      return { ...prev, sessions: nextSessions, totalCredits };
    });
  }

  function getSessionId(s: RoutineSessionCandidate): string {
    return s.partnerId + "|" + (s.activityId ?? s.activityTitle) + "|" + s.dateISO + "|" + s.time;
  }

  function handleShowAlternatives(s: RoutineSessionCandidate) {
    if (!prefs || !week) return;
    setEditingSessionId(getSessionId(s));
    const excludePartnerIds = week.sessions.map((x) => x.partnerId);
    const excludeActivityIds = week.sessions.map((x) => x.activityId ?? "").filter(Boolean);
    const alts = getAlternativesForSession({
      prefs,
      current: s,
      availableCredits: credits,
      excludePartnerIds,
      excludeActivityIds,
      limit: 6,
    });
    setAlternatives(alts);
  }

  function handlePickAlternative(targetId: string, replacement: RoutineSessionCandidate) {
    setWeek((prev) => {
      if (!prev) return prev;
      const nextSessions = prev.sessions.map((s) => (getSessionId(s) === targetId ? replacement : s));
      const totalCredits = nextSessions.reduce((sum, s) => sum + s.credits, 0);
      return { ...prev, sessions: nextSessions, totalCredits };
    });
    setEditingSessionId(null);
    setAlternatives([]);
  }

  function hasConflict(s: RoutineSessionCandidate): boolean {
    return reservations.some(
      (r) =>
        r.status === "confirmed" &&
        r.date === s.dateISO &&
        r.time === s.time
    );
  }

  function isDuplicate(s: RoutineSessionCandidate): boolean {
    return reservations.some(
      (r) =>
        r.status === "confirmed" &&
        r.partnerId === s.partnerId &&
        (s.kind === "gym"
          ? r.type === "gym"
          : r.type === "activity" && r.activityId === s.activityId) &&
        r.date === s.dateISO &&
        r.time === s.time
    );
  }

  async function handleBookWeek() {
    if (!week) return;
    setBooking(true);
    setBookingResult(null);
    const perSession: BookingResult["perSession"] = [];

    // Pre-validation: do not attempt impossible bookings.
    let remaining = credits;
    for (const s of week.sessions) {
      const sid = getSessionId(s);
      if (isDuplicate(s)) {
        perSession.push({ sessionId: sid, ok: false, error: "Já tens uma reserva igual." });
        continue;
      }
      if (hasConflict(s)) {
        perSession.push({ sessionId: sid, ok: false, error: "Conflito de horário com outra reserva." });
        continue;
      }
      if (s.credits > remaining) {
        perSession.push({ sessionId: sid, ok: false, error: "Créditos insuficientes." });
        continue;
      }
      remaining -= s.credits;
      perSession.push({ sessionId: sid, ok: true });
    }

    // Execute bookings only for the ones that passed pre-validation.
    const execResults: BookingResult["perSession"] = [];
    for (const s of week.sessions) {
      const sid = getSessionId(s);
      const pre = perSession.find((x) => x.sessionId === sid);
      if (!pre?.ok) {
        execResults.push({ sessionId: sid, ok: false, error: pre?.error ?? "Não foi possível reservar." });
        continue;
      }
      if (s.kind === "gym") {
        const result = addGymReservation({
          partnerId: s.partnerId,
          partnerName: s.partnerName,
          creditsRequired: s.credits,
        });
        execResults.push({
          sessionId: sid,
          ok: result.success,
          error: result.success ? undefined : result.error ?? "Erro ao reservar.",
        });
      } else {
        const result = addReservation({
          activityId: s.activityId ?? "",
          activityTitle: s.activityTitle,
          partnerId: s.partnerId,
          partnerName: s.partnerName,
          categorySlug: s.categorySlug,
          date: s.dateISO,
          time: s.time,
          creditsRequired: s.credits,
          location: s.location,
        });
        execResults.push({
          sessionId: sid,
          ok: result.success,
          error: result.success ? undefined : result.error ?? "Erro ao reservar.",
        });
      }
    }

    const okCount = execResults.filter((r) => r.ok).length;
    const failCount = execResults.length - okCount;
    setBookingResult({
      ok: okCount > 0 && failCount === 0,
      message:
        failCount === 0
          ? `Semana reservada com sucesso (${okCount}/${execResults.length}).`
          : `Reservas concluídas: ${okCount}/${execResults.length}. Revê as que falharam.`,
      perSession: execResults,
    });
    setBooking(false);
  }

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          FitLife Pass · Rotina
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          A tua rotina
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Sugestões semanais baseadas nas tuas preferências. Nada é reservado sem confirmação.
        </p>

        {!prefs ? (
          <GlassCard variant="dark" padding="lg" className="mt-8">
            <p className="text-sm font-medium text-white">
              Ainda não configuraste a tua rotina.
            </p>
            <p className="mt-2 text-sm text-white/70">
              Define o teu objetivo, frequência e tipos de atividade para gerar uma semana sugerida.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton
                variant="appPrimary"
                className="rounded-xl py-3 text-sm font-semibold"
                onClick={() => router.push("/dashboard/rotina/preferencias")}
              >
                Configurar preferências
              </PrimaryButton>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-white/80 underline-offset-2 hover:underline"
              >
                ← Voltar ao dashboard
              </Link>
            </div>
          </GlassCard>
        ) : (
          <>
            <GlassCard variant="dark" padding="lg" className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Esta semana
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    Saldo: <span className="text-white">{formatCredits(credits)}</span> ·{" "}
                    Planeado: <span className="text-white">{formatCredits(week?.totalCredits ?? 0)}</span> ·{" "}
                    Restante: <span className="text-white">{formatCredits(remainingAfterPlan)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/rotina/preferencias")}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
                  >
                    Editar preferências
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
                  >
                    Gerar nova rotina
                  </button>
                </div>
              </div>
            </GlassCard>

            {loading && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/70">
                A gerar rotina…
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm text-red-100">
                {error}{" "}
                <Link
                  href="/dashboard/rotina/preferencias"
                  className="font-medium underline underline-offset-2"
                >
                  Editar preferências
                </Link>
              </div>
            )}

            {week && week.sessions.length > 0 && (
              <div className="mt-8 space-y-3">
                {week.sessions.map((s) => {
                  const sid = getSessionId(s);
                  const conflict = hasConflict(s);
                  const dup = isDuplicate(s);
                  const failed = bookingResult?.perSession.find((x) => x.sessionId === sid && !x.ok);
                  return (
                    <GlassCard key={sid} variant="dark" padding="md" className="border-white/10 bg-white/[0.06]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                            {getSessionDayLabel(s)} · {s.time}
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {getSessionDisplayTitle(s)}
                          </p>
                          <p className="mt-1 text-sm text-white/70">
                            {getSessionDisplaySubtitle(s)}
                          </p>
                          <p className="mt-2 text-sm text-white/85">
                            <span className="font-medium text-white">
                              {s.credits}
                            </span>{" "}
                            créditos
                            {s.meta?.peakLabel ? (
                              <span className="ml-2 text-xs text-white/55">
                                · {s.meta.peakLabel}
                              </span>
                            ) : null}
                          </p>
                          {(conflict || dup) && (
                            <p className="mt-2 text-xs text-amber-200/90">
                              {dup ? "Já tens uma reserva igual." : "Conflito de horário com outra reserva."}
                            </p>
                          )}
                          {failed?.error && (
                            <p className="mt-2 text-xs text-red-200/90">
                              {failed.error}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <button
                            type="button"
                            onClick={() => handleShowAlternatives(s)}
                            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
                          >
                            Ver alternativas
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(sid)}
                            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
                          >
                            Remover
                          </button>
                        </div>
                      </div>

                      {editingSessionId === sid && alternatives.length > 0 && (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                            Alternativas (mesmo dia)
                          </p>
                          <div className="mt-3 grid gap-2">
                            {alternatives.map((a) => {
                              const aid = getSessionId(a);
                              return (
                                <button
                                  key={aid}
                                  type="button"
                                  onClick={() => handlePickAlternative(sid, a)}
                                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:bg-white/10"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-white">
                                        {getSessionDisplayTitle(a)}
                                      </p>
                                      <p className="mt-0.5 text-xs text-white/65">
                                        {a.partnerName} · {a.time}
                                      </p>
                                    </div>
                                    <span className="shrink-0 text-xs text-white/70">
                                      {a.credits} cr
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSessionId(null);
                              setAlternatives([]);
                            }}
                            className="mt-3 text-sm font-medium text-white/70 underline-offset-2 hover:underline"
                          >
                            Fechar
                          </button>
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            )}

            {bookingResult && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/85">
                {bookingResult.message}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-white/80 underline-offset-2 hover:underline"
              >
                ← Voltar ao dashboard
              </Link>
              <PrimaryButton
                variant="appPrimary"
                className="rounded-xl py-3 text-sm font-semibold"
                onClick={handleBookWeek}
                loading={booking}
                loadingLabel="A reservar…"
                disabled={!week || week.sessions.length === 0}
              >
                Reservar semana
              </PrimaryButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

