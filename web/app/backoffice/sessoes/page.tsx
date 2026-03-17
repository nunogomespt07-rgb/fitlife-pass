"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import Calendar from "@/app/components/ui/Calendar";
import { getAllPartnersWithCategory, getMockActivitiesForPartner } from "@/lib/activitiesData";
import {
  getWeekdayForDateISO,
  startOfWeekMonday,
  getStoredWeekSchedule,
  setStoredWeekSchedule,
  type BackofficeSession,
  type BackofficeWeekSchedule,
} from "@/lib/backoffice";
import { computeCreditsForSlot } from "@/lib/creditConfig";

function isoYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function emptySchedule(partnerId: string, weekStartISO: string): BackofficeWeekSchedule {
  return { partnerId, weekStartISO, sessions: [], updatedAt: new Date().toISOString() };
}

export default function BackofficeSessoesPage() {
  const partners = useMemo(() => getAllPartnersWithCategory(), []);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [draftDateISO, setDraftDateISO] = useState(() => isoYMD(new Date()));
  const weekStartISO = useMemo(() => isoYMD(startOfWeekMonday(new Date(draftDateISO + "T12:00:00"))), [draftDateISO]);
  const [schedule, setSchedule] = useState<BackofficeWeekSchedule | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draftType, setDraftType] = useState<BackofficeSession["type"]>("group_class");
  const [draftName, setDraftName] = useState<string>("");
  const [draftTime, setDraftTime] = useState("18:00");
  const [draftDuration, setDraftDuration] = useState(60);
  const [draftCapacity, setDraftCapacity] = useState(12);
  const [draftFitlifeSlots, setDraftFitlifeSlots] = useState(8);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/backoffice/session", { method: "GET" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => ({}))) as { partnerId?: string };
        if (data.partnerId) setPartnerId(data.partnerId);
      } catch {
        // ignore (layout middleware will redirect if not authed)
      }
    })();
  }, [partners]);

  useEffect(() => {
    if (!partnerId) return;
    const existing = getStoredWeekSchedule(partnerId, weekStartISO);
    setSchedule(existing ?? emptySchedule(partnerId, weekStartISO));
  }, [partnerId, weekStartISO]);

  const partner = useMemo(() => {
    if (!partnerId) return null;
    return partners.find((p) => p.id === partnerId) ?? null;
  }, [partners, partnerId]);

  const partnerMode = useMemo(() => {
    const isCourt = partner?.partnerType === "court_booking";
    const isAccess = partner?.partnerType === "gym_access" || partner?.partnerType === "pool_access";
    const isProfessional =
      partner?.categorySlug === "personal-training" ||
      partner?.categorySlug === "nutricao" ||
      partner?.categorySlug === "massagem-desportiva";
    const isGroupClass = !isCourt && !isAccess && !isProfessional;
    return { isCourt, isAccess, isProfessional, isGroupClass };
  }, [partner]);

  const classTemplates = useMemo(() => {
    if (!partner) return [];
    if (!partnerMode.isGroupClass) return [];
    const acts = getMockActivitiesForPartner(partner.id);
    const titles = [...new Set(acts.map((a) => a.title).filter(Boolean))];
    return titles.slice(0, 12);
  }, [partner, partnerMode.isGroupClass]);

  function save() {
    if (!schedule) return;
    setStoredWeekSchedule({ ...schedule, updatedAt: new Date().toISOString() });
    setMsg("Guardado.");
    setTimeout(() => setMsg(null), 2000);
  }

  function startAdd() {
    if (!partner) return;
    setAdding(true);
    const type: BackofficeSession["type"] = partnerMode.isProfessional
      ? "professional"
      : partnerMode.isAccess
        ? "access_window"
        : partnerMode.isCourt
          ? "court"
          : "group_class";
    setDraftType(type);

    if (type === "professional") {
      const serviceName =
        partner.categorySlug === "personal-training"
          ? "Sessão de PT"
          : partner.categorySlug === "nutricao"
            ? "Consulta de Nutrição"
            : partner.categorySlug === "massagem-desportiva"
              ? "Sessão de Massagem"
              : "Sessão";
      setDraftName(serviceName);
      setDraftDuration(60);
      setDraftCapacity(1);
      setDraftFitlifeSlots(1);
      return;
    }

    if (type === "group_class") {
      const first = classTemplates[0] ?? "Nova aula";
      setDraftName(first);
      setDraftDuration(60);
      setDraftCapacity(12);
      setDraftFitlifeSlots(8);
      return;
    }

    if (type === "court") {
      setDraftName("Campo 1");
      setDraftDuration(60);
      setDraftCapacity(4);
      setDraftFitlifeSlots(4);
      return;
    }

    // access_window
    setDraftName("Janela de acesso");
    setDraftDuration(180);
    setDraftCapacity(40);
    setDraftFitlifeSlots(20);
  }

  function confirmAdd() {
    if (!schedule || !partner) return;
    const id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const isProfessional = draftType === "professional";
    const cap = isProfessional ? 1 : Math.max(1, Math.floor(draftCapacity));
    const slots = isProfessional ? 1 : Math.max(0, Math.min(cap, Math.floor(draftFitlifeSlots)));
    const durationMinutes = Math.max(15, Math.floor(draftDuration));
    const weekday = getWeekdayForDateISO(draftDateISO);
    const serviceKey = draftName || (draftType === "professional" ? "Sessão" : "Sessão");
    const fallbackOffPeak = partner.minCredits ?? 8;
    const fallbackPeak = Math.max(fallbackOffPeak, fallbackOffPeak + 2);
    const computed = computeCreditsForSlot({
      partnerId: schedule.partnerId,
      serviceKey,
      dateISO: draftDateISO,
      timeHHMM: draftTime,
      fallbackOffPeakCredits: fallbackOffPeak,
      fallbackPeakCredits: fallbackPeak,
    });

    const base: BackofficeSession = {
      id,
      partnerId: schedule.partnerId,
      type: draftType,
      name: draftName,
      weekday,
      time: draftTime,
      durationMinutes,
      capacity: cap,
      fitlifeSlots: slots,
      credits: computed.credits,
      sessionLocation: partner.location,
    };

    const withTypeFields: BackofficeSession =
      draftType === "professional"
        ? {
            ...base,
            serviceName: draftName,
            professionalName: partner.name,
            specialties: partner.provider?.type === "trainer" ? partner.provider.specialties : undefined,
          }
        : draftType === "group_class"
          ? { ...base, className: draftName }
          : draftType === "court"
            ? { ...base, courtName: draftName }
            : { ...base, windowName: draftName, endTime: undefined };

    setSchedule({ ...schedule, sessions: [withTypeFields, ...schedule.sessions], updatedAt: new Date().toISOString() });
    setAdding(false);
  }

  function removeSession(id: string) {
    if (!schedule) return;
    setSchedule({ ...schedule, sessions: schedule.sessions.filter((s) => s.id !== id), updatedAt: new Date().toISOString() });
  }

  return (
    <div>
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Sessões / Aulas
            </p>
            <p className="mt-2 text-sm text-white/70">
              Gestão rápida de sessões (MVP). Para slots e duplicação, usa a Agenda.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={startAdd}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
            >
              {partnerMode.isProfessional ? "+ Adicionar slot" : partnerMode.isGroupClass ? "+ Adicionar horário" : "+ Adicionar sessão"}
            </button>
          </div>
        </div>
      </GlassCard>

      {adding && (
        <GlassCard variant="app" padding="lg" className="mt-4 border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            {draftType === "professional"
              ? "Novo slot"
              : draftType === "group_class"
                ? "Novo horário (aula)"
                : "Nova sessão"}
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Data
            </p>
            <Calendar
              value={draftDateISO}
              onChange={(ymd) => setDraftDateISO(ymd)}
              className="mt-3 w-full sm:w-[360px]"
            />
          </div>

          {draftType === "group_class" ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Aula existente
              </p>
              <select
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
              >
                {classTemplates.length === 0 ? (
                  <option value="Nova aula" className="bg-[#020617]">Nova aula</option>
                ) : (
                  classTemplates.map((t) => (
                    <option key={t} value={t} className="bg-[#020617]">
                      {t}
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Serviço
              </p>
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
              />
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Hora</p>
              <input
                type="time"
                value={draftTime}
                onChange={(e) => setDraftTime(e.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Duração (min)</p>
              <input
                inputMode="numeric"
                value={draftDuration}
                onChange={(e) => setDraftDuration(Number(e.target.value))}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Vagas
              </p>
              <input
                inputMode="numeric"
                value={draftCapacity}
                onChange={(e) => setDraftCapacity(Number(e.target.value))}
                disabled={draftType === "professional"}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
              />
              {partnerMode.isProfessional && (
                <p className="mt-2 text-xs text-white/55">
                  Sessão individual: capacidade fixa a 1.
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Slots FitLife
              </p>
              <input
                inputMode="numeric"
                value={draftFitlifeSlots}
                onChange={(e) => setDraftFitlifeSlots(Number(e.target.value))}
                disabled={draftType === "professional"}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-sm font-medium text-white/70 underline-offset-2 hover:underline"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmAdd}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
            >
              Adicionar
            </button>
          </div>
        </GlassCard>
      )}

      <div className="mt-6 grid gap-3">
        {(schedule?.sessions ?? []).length === 0 ? (
          <GlassCard variant="app" padding="lg" className="border-white/10">
            <p className="text-sm text-white/75">Sem sessões criadas.</p>
          </GlassCard>
        ) : (
          (schedule?.sessions ?? [])
            .slice()
            .sort((a, b) => (a.weekday + a.time).localeCompare(b.weekday + b.time))
            .map((s) => (
              <GlassCard key={s.id} variant="app" padding="md" className="border-white/10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {s.type === "group_class"
                        ? (s.className ?? s.name)
                        : s.type === "professional"
                          ? (s.serviceName ?? s.name)
                          : s.name}
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      {s.weekday} · {s.time} · {s.durationMinutes} min · cap {s.capacity} · slots {s.fitlifeSlots}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSession(s.id)}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 hover:bg-white/10"
                  >
                    Remover
                  </button>
                </div>
              </GlassCard>
            ))
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        {msg ? <span className="text-sm text-white/70">{msg}</span> : <span />}
        <PrimaryButton
          variant="appPrimary"
          className="rounded-xl py-3 text-sm font-semibold"
          onClick={save}
        >
          Guardar
        </PrimaryButton>
      </div>
    </div>
  );
}

