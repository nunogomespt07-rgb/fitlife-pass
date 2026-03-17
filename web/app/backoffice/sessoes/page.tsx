"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";
import {
  getStoredWeekSchedule,
  setStoredWeekSchedule,
  startOfWeekMonday,
  type BackofficeSession,
  type BackofficeWeekSchedule,
} from "@/lib/backoffice";
import { getCurrentBackofficePartnerId, migrateLegacySelectedPartner } from "@/lib/backofficePartner";

function isoYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function emptySchedule(partnerId: string, weekStartISO: string): BackofficeWeekSchedule {
  return { partnerId, weekStartISO, sessions: [], updatedAt: new Date().toISOString() };
}

export default function BackofficeSessoesPage() {
  const partners = useMemo(() => getAllPartnersWithCategory(), []);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [weekStartISO] = useState(() => isoYMD(startOfWeekMonday(new Date())));
  const [schedule, setSchedule] = useState<BackofficeWeekSchedule | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const pid = getCurrentBackofficePartnerId() ?? migrateLegacySelectedPartner();
    setPartnerId(pid);
  }, [partners]);

  useEffect(() => {
    if (!partnerId) return;
    const existing = getStoredWeekSchedule(partnerId, weekStartISO);
    setSchedule(existing ?? emptySchedule(partnerId, weekStartISO));
  }, [partnerId, weekStartISO]);

  function save() {
    if (!schedule) return;
    setStoredWeekSchedule({ ...schedule, updatedAt: new Date().toISOString() });
    setMsg("Guardado.");
    setTimeout(() => setMsg(null), 2000);
  }

  function addSession() {
    if (!schedule) return;
    const partner = partners.find((p) => p.id === schedule.partnerId) ?? null;
    const isCourt = partner?.partnerType === "court_booking";
    const isAccess = partner?.partnerType === "gym_access" || partner?.partnerType === "pool_access";
    const isProfessional =
      partner?.categorySlug === "personal-training" ||
      partner?.categorySlug === "nutricao" ||
      partner?.categorySlug === "massagem-desportiva";
    const type: BackofficeSession["type"] = isProfessional
      ? "professional"
      : isAccess
        ? "access_window"
        : isCourt
          ? "court"
          : "group_class";
    const id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const next: BackofficeSession = {
      id,
      partnerId: schedule.partnerId,
      type,
      name:
        type === "professional"
          ? "Sessão"
          : type === "access_window"
            ? "Acesso"
            : type === "court"
              ? "Slot"
              : "Nova aula",
      weekday: "segunda",
      time: "18:00",
      durationMinutes: 60,
      capacity: 12,
      fitlifeSlots: 8,
      credits: 8,
      ...(type === "professional"
        ? {
            serviceName:
              partner?.categorySlug === "personal-training"
                ? "Sessão de PT"
                : partner?.categorySlug === "nutricao"
                  ? "Consulta de Nutrição"
                  : partner?.categorySlug === "massagem-desportiva"
                    ? "Sessão de Massagem"
                    : "Sessão",
            professionalName: partner?.name,
            specialties: partner?.provider?.type === "trainer" ? partner.provider.specialties : undefined,
            sessionLocation: partner?.location,
          }
        : type === "group_class"
          ? { className: "Nova aula", sessionLocation: partner?.location }
          : type === "court"
            ? { courtName: "Campo 1", sessionLocation: partner?.location }
            : type === "access_window"
              ? { windowName: "Janela de acesso", endTime: "21:00", sessionLocation: partner?.location }
              : {}),
    };
    setSchedule({ ...schedule, sessions: [next, ...schedule.sessions], updatedAt: new Date().toISOString() });
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
              onClick={addSession}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
            >
              + Adicionar sessão
            </button>
          </div>
        </div>
      </GlassCard>

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
                    <p className="text-sm font-semibold text-white">{s.name}</p>
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

