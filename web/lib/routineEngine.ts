import {
  getAllPartnersWithCategory,
  getMockActivitiesForPartner,
  activityDateToISO,
  type MockActivity,
  type PartnerWithCategory,
} from "@/lib/activitiesData";
import type {
  RoutineActivityType,
  RoutineGoal,
  RoutinePreferences,
  TimeSlot,
} from "@/lib/routinePreferences";

export type RoutineSessionKind = "activity" | "gym";

export type RoutineSessionCandidate = {
  kind: RoutineSessionKind;
  categorySlug: string;
  partnerId: string;
  partnerName: string;
  partnerCity?: string | null;
  activityId?: string;
  activityTitle: string;
  location?: string;
  dateISO: string; // YYYY-MM-DD
  time: string; // HH:MM
  credits: number;
  score: number;
  meta?: { peakLabel?: string };
};

export type RoutineWeek = {
  weekStartISO: string; // YYYY-MM-DD (Monday)
  sessions: RoutineSessionCandidate[];
  totalCredits: number;
};

function parseTimeHM(t: string): number {
  const [h, m] = t.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

function slotMatches(slot: TimeSlot, time: string): boolean {
  const mins = parseTimeHM(time);
  switch (slot) {
    case "manha":
      return mins >= 7 * 60 && mins < 11 * 60;
    case "almoco":
      return mins >= 11 * 60 && mins < 14 * 60;
    case "pos_trabalho":
      return mins >= 17 * 60 && mins < 20 * 60;
    case "noite":
      return mins >= 20 * 60 && mins <= 23 * 60 + 30;
    default:
      return false;
  }
}

function isoYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfNextWeekMonday(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  // JS: Sunday=0, Monday=1...
  const day = d.getDay();
  const daysUntilNextMonday = ((8 - day) % 7) || 7;
  d.setDate(d.getDate() + daysUntilNextMonday);
  return d;
}

function weekdayLabelPT(ymd: string): string {
  const d = new Date(ymd + "T12:00:00");
  const labels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return labels[d.getDay()] ?? "Dia";
}

function normalizeTypeToCategorySlug(t: RoutineActivityType): string[] {
  switch (t) {
    case "gym_access":
      return ["ginasios"];
    case "yoga":
      return ["yoga"];
    case "pilates":
    case "pilates_reformer":
    case "personal_training":
    case "boxe":
    case "danca":
    case "nutricao":
    case "massagem_desportiva":
      return ["estudios"];
    case "piscina":
      return ["piscinas"];
    case "crossfit":
      return ["crossfit"];
    case "padel":
      return ["padel"];
    default:
      return ["estudios"];
  }
}

function goalWeights(goal: RoutineGoal): Record<RoutineActivityType, number> {
  const base: Record<RoutineActivityType, number> = {
    gym_access: 1,
    yoga: 1,
    pilates: 1,
    piscina: 1,
    crossfit: 1,
    boxe: 1,
    danca: 1,
    padel: 1,
    pilates_reformer: 1,
    personal_training: 1,
    nutricao: 1,
    massagem_desportiva: 1,
  };
  if (goal === "perder_peso" || goal === "melhorar_performance") {
    return { ...base, crossfit: 5, gym_access: 4, boxe: 4, pilates: 3, padel: 3 };
  }
  if (goal === "relaxar_bem_estar") {
    return { ...base, yoga: 5, piscina: 4, massagem_desportiva: 5, pilates: 3 };
  }
  if (goal === "manter_forma") {
    return { ...base, gym_access: 4, yoga: 3, pilates: 3, piscina: 3, padel: 3, crossfit: 3 };
  }
  if (goal === "ganhar_massa") {
    return { ...base, gym_access: 5, personal_training: 4, pilates_reformer: 4, pilates: 3 };
  }
  return base;
}

function targetWeekdays(frequency: number): number[] {
  // 1=Mon ... 0=Sun; we use Date.getDay.
  // Spread sessions with a simple pattern.
  switch (frequency) {
    case 2:
      return [2, 5]; // Tue, Fri
    case 3:
      return [1, 3, 5]; // Mon, Wed, Fri
    case 4:
      return [1, 2, 4, 6]; // Mon, Tue, Thu, Sat
    case 5:
      return [1, 2, 3, 5, 6]; // Mon, Tue, Wed, Fri, Sat
    default:
      return [1, 3, 5];
  }
}

function candidateFromMockActivity(
  categorySlug: string,
  partner: PartnerWithCategory,
  act: MockActivity
): RoutineSessionCandidate {
  return {
    kind: "activity",
    categorySlug,
    partnerId: partner.id,
    partnerName: partner.name,
    partnerCity: partner.city ?? null,
    activityId: act.id,
    activityTitle: act.title,
    location: act.location,
    dateISO: activityDateToISO(act.date),
    time: act.time,
    credits: act.credits,
    score: 0,
    meta: act.peakLabel ? { peakLabel: act.peakLabel } : undefined,
  };
}

function gymCandidateForPartner(categorySlug: string, partner: PartnerWithCategory): RoutineSessionCandidate {
  const credits = Math.max(1, partner.creditsPerEntry ?? partner.minCredits ?? 6);
  const now = new Date();
  const dateISO = isoYMD(now);
  const time = "18:00";
  return {
    kind: "gym",
    categorySlug,
    partnerId: partner.id,
    partnerName: partner.name,
    partnerCity: partner.city ?? null,
    activityTitle: "Acesso ginásio",
    location: partner.location,
    dateISO,
    time,
    credits,
    score: 0,
  };
}

export function buildRoutineCandidates(prefs: RoutinePreferences): RoutineSessionCandidate[] {
  const partners = getAllPartnersWithCategory();
  const preferredCategories = new Set(
    prefs.preferredActivityTypes.flatMap((t) => normalizeTypeToCategorySlug(t))
  );
  const partnerPool = partners.filter((p) => preferredCategories.has(p.categorySlug));

  const now = new Date();
  const minDate = isoYMD(now);
  const maxDate = isoYMD(new Date(now.getTime() + 14 * 86400000));

  const candidates: RoutineSessionCandidate[] = [];

  for (const p of partnerPool) {
    if (p.partner.partnerType === "gym_access") {
      candidates.push(gymCandidateForPartner(p.categorySlug, p.partner));
      continue;
    }
    const acts = getMockActivitiesForPartner(p.id);
    for (const act of acts) {
      const dateISO = activityDateToISO(act.date);
      if (dateISO < minDate || dateISO > maxDate) continue;
      candidates.push(candidateFromMockActivity(p.categorySlug, p.partner, act));
    }
  }

  return candidates;
}

function scoreCandidate(
  c: RoutineSessionCandidate,
  prefs: RoutinePreferences,
  preferredSlots: TimeSlot[],
  usedPartnerIds: Set<string>,
  usedTitles: Set<string>
): number {
  let score = 0;

  // Goal weighting by category approximation
  const weights = goalWeights(prefs.goal);
  const guessedType: RoutineActivityType =
    c.categorySlug === "ginasios"
      ? "gym_access"
      : c.categorySlug === "yoga"
        ? "yoga"
        : c.categorySlug === "piscinas"
          ? "piscina"
          : c.categorySlug === "crossfit"
            ? "crossfit"
            : c.categorySlug === "padel"
              ? "padel"
              : "pilates";
  score += (weights[guessedType] ?? 1) * 10;

  // Time slot preference
  const slotOk = preferredSlots.some((s) => slotMatches(s, c.time));
  score += slotOk ? 18 : 0;

  // Variety
  if (usedPartnerIds.has(c.partnerId)) score -= 8;
  if (usedTitles.has(c.activityTitle)) score -= 6;

  // Slightly prefer lower credits to fit budget
  score += Math.max(0, 12 - c.credits);

  return score;
}

export function generateRoutineWeek(params: {
  prefs: RoutinePreferences;
  availableCredits: number;
  now?: Date;
}): RoutineWeek {
  const { prefs, availableCredits } = params;
  const now = params.now ?? new Date();
  const weekStart = startOfNextWeekMonday(now);
  const weekStartISO = isoYMD(weekStart);

  const candidates = buildRoutineCandidates(prefs);

  const desiredWeekdays = targetWeekdays(prefs.weeklyFrequency);
  const usedPartnerIds = new Set<string>();
  const usedTitles = new Set<string>();

  const selected: RoutineSessionCandidate[] = [];
  let remaining = Math.max(0, Math.floor(availableCredits));

  for (const wd of desiredWeekdays) {
    const best = candidates
      .map((c) => {
        const d = new Date(c.dateISO + "T12:00:00");
        const day = d.getDay();
        const inTargetWeek =
          c.dateISO >= weekStartISO && c.dateISO < isoYMD(new Date(weekStart.getTime() + 7 * 86400000));
        const matchesDay = day === wd;
        const creditOk = c.credits <= remaining;
        const slotOk = prefs.preferredTimeSlots.length === 0
          ? true
          : prefs.preferredTimeSlots.some((s) => slotMatches(s, c.time));
        let score = 0;
        if (inTargetWeek && matchesDay && creditOk) {
          score = scoreCandidate(c, prefs, prefs.preferredTimeSlots, usedPartnerIds, usedTitles);
          if (!slotOk) score -= 12;
        } else {
          score = -9999;
        }
        return { c, score };
      })
      .sort((a, b) => b.score - a.score)[0];

    if (!best || best.score < -1000) {
      continue;
    }

    const chosen = { ...best.c, score: best.score };
    selected.push(chosen);
    remaining -= chosen.credits;
    usedPartnerIds.add(chosen.partnerId);
    usedTitles.add(chosen.activityTitle);
  }

  // If we couldn't fill, relax: pick best alternatives in the week ignoring weekday match.
  if (selected.length < prefs.weeklyFrequency) {
    const need = prefs.weeklyFrequency - selected.length;
    const pool = candidates
      .filter((c) => c.credits <= remaining)
      .filter(
        (c) =>
          c.dateISO >= weekStartISO &&
          c.dateISO < isoYMD(new Date(weekStart.getTime() + 7 * 86400000))
      )
      .filter((c) => !selected.some((s) => s.dateISO === c.dateISO && s.time === c.time))
      .map((c) => ({
        c,
        score: scoreCandidate(c, prefs, prefs.preferredTimeSlots, usedPartnerIds, usedTitles) - (usedPartnerIds.has(c.partnerId) ? 6 : 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, need);

    for (const p of pool) {
      const chosen = { ...p.c, score: p.score };
      selected.push(chosen);
      remaining -= chosen.credits;
      usedPartnerIds.add(chosen.partnerId);
      usedTitles.add(chosen.activityTitle);
      if (selected.length >= prefs.weeklyFrequency) break;
    }
  }

  const totalCredits = selected.reduce((sum, s) => sum + s.credits, 0);
  return {
    weekStartISO,
    sessions: selected.sort((a, b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time)),
    totalCredits,
  };
}

export function getSessionDisplayTitle(s: RoutineSessionCandidate): string {
  return s.kind === "gym" ? "Acesso ginásio" : s.activityTitle;
}

export function getSessionDisplaySubtitle(s: RoutineSessionCandidate): string {
  const parts = [s.partnerName, s.location].filter(Boolean);
  return parts.join(" · ");
}

export function getSessionDayLabel(s: RoutineSessionCandidate): string {
  return `${weekdayLabelPT(s.dateISO)} · ${new Date(s.dateISO + "T12:00:00").toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}`;
}

export function getAlternativesForSession(params: {
  prefs: RoutinePreferences;
  current: RoutineSessionCandidate;
  availableCredits: number;
  excludePartnerIds?: string[];
  excludeActivityIds?: string[];
  limit?: number;
}): RoutineSessionCandidate[] {
  const { prefs, current, availableCredits } = params;
  const limit = params.limit ?? 5;
  const candidates = buildRoutineCandidates(prefs)
    .filter((c) => c.credits <= availableCredits)
    .filter((c) => c.dateISO === current.dateISO) // same day for simple swapping
    .filter((c) => c.partnerId !== current.partnerId || c.activityId !== current.activityId)
    .filter((c) => !(params.excludePartnerIds ?? []).includes(c.partnerId))
    .filter((c) => !((params.excludeActivityIds ?? []).includes(c.activityId ?? "")));

  const usedPartnerIds = new Set<string>(params.excludePartnerIds ?? []);
  const usedTitles = new Set<string>();
  return candidates
    .map((c) => ({ ...c, score: scoreCandidate(c, prefs, prefs.preferredTimeSlots, usedPartnerIds, usedTitles) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

