"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import Calendar from "@/app/components/ui/Calendar";
import {
  getAllPartnersWithCategory,
  getMockActivitiesForPartner,
  activityDateToISO,
  type PartnerWithCategory,
} from "@/lib/activitiesData";
import {
  addDays,
  duplicateScheduleToNextWeek,
  getStoredWeekSchedule,
  getWeekdayForDateISO,
  publishWeekAvailability,
  setStoredWeekSchedule,
  startOfWeekMonday,
  type BackofficeSession,
  type BackofficeWeekSchedule,
  type Weekday,
  weekdayLabel,
} from "@/lib/backoffice";
import { getAuthedBackofficePartnerId } from "@/lib/backofficeAuth";

const weekdays: Weekday[] = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

function clampInt(n: number, min: number, max: number): number {
  const x = Math.floor(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function sessionId(partnerId: string, base: string): string {
  return `${partnerId}-${base}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildDefaultSchedule(partner: PartnerWithCategory, weekStartISO: string): BackofficeWeekSchedule {
  const nowISO = new Date().toISOString();
  const sessions: BackofficeSession[] = [];

  if (partner.partnerType === "gym_access" || partner.partnerType === "pool_access") {
    // Access windows – simple defaults (editable later)
    const windows = [
      { name: "Acesso manhã", weekday: "segunda" as const, time: "08:00", durationMinutes: 180, capacity: 40, fitlifeSlots: 20 },
      { name: "Acesso pós-trabalho", weekday: "quarta" as const, time: "18:00", durationMinutes: 180, capacity: 50, fitlifeSlots: 25 },
      { name: "Acesso sábado", weekday: "sabado" as const, time: "10:00", durationMinutes: 180, capacity: 60, fitlifeSlots: 30 },
    ];
    for (const w of windows) {
      sessions.push({
        id: sessionId(partner.id, `${w.weekday}-${w.time}`),
        partnerId: partner.id,
        type: "access_window",
        name: w.name,
        weekday: w.weekday,
        time: w.time,
        durationMinutes: w.durationMinutes,
        capacity: w.capacity,
        fitlifeSlots: w.fitlifeSlots,
        credits: partner.creditsPerEntry ?? partner.minCredits ?? 6,
        sessionLocation: partner.location,
      });
    }
    return { partnerId: partner.id, weekStartISO, sessions, updatedAt: nowISO };
  }

  const acts = getMockActivitiesForPartner(partner.id);
  // Use first occurrence of each weekday+time+title within next 7 days to seed schedule.
  const seen = new Set<string>();
  for (const act of acts) {
    const dateISO = activityDateToISO(act.date);
    if (dateISO < weekStartISO || dateISO >= addDays(weekStartISO, 7)) continue;
    const wd = getWeekdayForDateISO(dateISO);
    const key = `${wd}-${act.time}-${act.title}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const isCourt = partner.partnerType === "court_booking";
    const isProfessional =
      partner.categorySlug === "personal-training" ||
      partner.categorySlug === "nutricao" ||
      partner.categorySlug === "massagem-desportiva";
    const type: BackofficeSession["type"] = isProfessional ? "professional" : isCourt ? "court" : "group_class";

    const serviceName =
      partner.categorySlug === "personal-training"
        ? "Sessão de PT"
        : partner.categorySlug === "nutricao"
          ? "Consulta de Nutrição"
          : partner.categorySlug === "massagem-desportiva"
            ? "Sessão de Massagem"
            : undefined;

    sessions.push({
      id: sessionId(partner.id, key),
      partnerId: partner.id,
      type,
      name: act.title,
      weekday: wd,
      time: act.time,
      durationMinutes: act.durationMinutes,
      capacity: act.spots,
      fitlifeSlots: Math.min(act.spots, Math.max(1, Math.floor(act.spots * 0.6))),
      credits: act.credits,
      sessionLocation: act.location ?? partner.location,
      ...(type === "professional"
        ? {
            serviceName,
            professionalName: act.trainer?.name ?? partner.name,
            specialties:
              (act.trainer?.specialties?.length ?? 0) > 0
                ? act.trainer?.specialties
                : partner.provider?.type === "trainer"
                  ? partner.provider.specialties
                  : undefined,
          }
        : type === "group_class"
          ? { className: act.title }
          : type === "court"
            ? { courtName: act.title }
            : {}),
    });
  }

  return { partnerId: partner.id, weekStartISO, sessions, updatedAt: nowISO };
}

export default function BackofficeAgendaPage() {
  const allPartners = useMemo(() => getAllPartnersWithCategory(), []);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [weekStartISO, setWeekStartISO] = useState(() => {
    const d = startOfWeekMonday(new Date());
    return d.toISOString().slice(0, 10);
  });
  const [day, setDay] = useState<Weekday>("segunda");
  const [schedule, setSchedule] = useState<BackofficeWeekSchedule | null>(null);
  const [dirty, setDirty] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const partner = useMemo(
    () => (partnerId ? allPartners.find((p) => p.id === partnerId) ?? null : null),
    [partnerId, allPartners]
  );

  useEffect(() => {
    setPartnerId(getAuthedBackofficePartnerId());
  }, [allPartners]);

  useEffect(() => {
    if (!partnerId) return;
    const existing = getStoredWeekSchedule(partnerId, weekStartISO);
    if (existing) {
      setSchedule(existing);
      setDirty(false);
      return;
    }
    const p = allPartners.find((x) => x.id === partnerId);
    if (!p) return;
    const seeded = buildDefaultSchedule(p, weekStartISO);
    setStoredWeekSchedule(seeded);
    setSchedule(seeded);
    setDirty(false);
  }, [partnerId, weekStartISO, allPartners]);

  const daySessions = useMemo(() => {
    if (!schedule) return [];
    return schedule.sessions
      .filter((s) => s.weekday === day)
      .sort((a, b) => (a.time + a.name).localeCompare(b.time + b.name));
  }, [schedule, day]);

  function updateSession(id: string, patch: Partial<BackofficeSession>) {
    setSchedule((prev) => {
      if (!prev) return prev;
      const nextSessions = prev.sessions.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      );
      const next = { ...prev, sessions: nextSessions, updatedAt: new Date().toISOString() };
      return next;
    });
    setDirty(true);
    setSavedMsg(null);
  }

  function save() {
    if (!schedule) return;
    setStoredWeekSchedule(schedule);
    publishWeekAvailability(schedule);
    setDirty(false);
    setSavedMsg("Alterações guardadas.");
    setTimeout(() => setSavedMsg(null), 2500);
  }

  function duplicateNextWeek() {
    if (!partnerId) return;
    const next = duplicateScheduleToNextWeek(partnerId, weekStartISO);
    if (next) {
      setWeekStartISO(next.weekStartISO);
      setSchedule(next);
      setDirty(false);
      setSavedMsg("Semana duplicada.");
      setTimeout(() => setSavedMsg(null), 2500);
    }
  }

  return (
    <div>
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Agenda / Disponibilidade
            </p>
            <p className="mt-2 text-sm text-white/75">
              Edita capacidade e slots FitLife por sessão. Interações rápidas e inline.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Calendar
              value={weekStartISO}
              onChange={(ymd) => {
                const monday = startOfWeekMonday(new Date(ymd + "T12:00:00"));
                setWeekStartISO(monday.toISOString().slice(0, 10));
              }}
              className="w-full sm:w-[360px]"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {weekdays.map((wd) => (
            <button
              key={wd}
              type="button"
              onClick={() => setDay(wd)}
              className={
                day === wd
                  ? "rounded-full border border-white/25 bg-white/12 px-3 py-2 text-sm font-semibold text-white"
                  : "rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/8 hover:border-white/20"
              }
            >
              {weekdayLabel(wd)}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="mt-6 grid gap-4">
        {daySessions.length === 0 ? (
          <GlassCard variant="app" padding="lg" className="border-white/10">
            <p className="text-sm text-white/75">Sem sessões para este dia.</p>
          </GlassCard>
        ) : (
          daySessions.map((s) => (
            <GlassCard key={s.id} variant="app" padding="md" className="border-white/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    {s.time} · {s.durationMinutes} min
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {s.type === "professional" ? (s.professionalName ?? s.serviceName ?? s.name) : s.className ?? s.name}
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    {s.sessionLocation ?? partner?.location ?? ""}
                  </p>
                  <p className="mt-2 text-sm text-white/80">
                    {s.credits} crédito{s.credits !== 1 ? "s" : ""} · Capacidade {s.capacity}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-xs font-semibold text-white/70">Slots FitLife</span>
                    <button
                      type="button"
                      onClick={() => updateSession(s.id, { fitlifeSlots: clampInt(s.fitlifeSlots - 1, 0, s.capacity) })}
                      className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-white/90 hover:bg-white/10"
                      aria-label="Diminuir slots FitLife"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white tabular-nums">
                      {s.fitlifeSlots}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateSession(s.id, { fitlifeSlots: clampInt(s.fitlifeSlots + 1, 0, s.capacity) })}
                      className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-white/90 hover:bg-white/10"
                      aria-label="Aumentar slots FitLife"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-xs font-semibold text-white/70">Capacidade</span>
                    <button
                      type="button"
                      onClick={() => {
                        const nextCap = clampInt(s.capacity - 1, 1, 999);
                        updateSession(s.id, { capacity: nextCap, fitlifeSlots: Math.min(s.fitlifeSlots, nextCap) });
                      }}
                      className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-white/90 hover:bg-white/10"
                      aria-label="Diminuir capacidade"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white tabular-nums">
                      {s.capacity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateSession(s.id, { capacity: clampInt(s.capacity + 1, 1, 999) })}
                      className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-white/90 hover:bg-white/10"
                      aria-label="Aumentar capacidade"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={duplicateNextWeek}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
          >
            Duplicar para próxima semana
          </button>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && <span className="text-sm text-white/70">{savedMsg}</span>}
          <PrimaryButton
            variant="appPrimary"
            className="rounded-xl py-3 text-sm font-semibold"
            onClick={save}
            disabled={!dirty}
          >
            Guardar alterações
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

