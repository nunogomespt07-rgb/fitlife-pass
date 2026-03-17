import type { MockActivity } from "@/lib/activitiesData";
import { activityDateToISO } from "@/lib/activitiesData";

export type PublicSession = {
  id: string;
  partnerId: string;
  /** Public-facing title (class name / session name). */
  name: string;
  /** Weekday session anchor as ISO date (YYYY-MM-DD). */
  dateISO: string;
  time: string; // HH:MM
  durationMinutes: number;
  credits: number;
  /** Available FitLife slots for this session (public availability). */
  fitlifeSlots: number;
  location?: string;
  /** Public professional fields (for individual services). */
  professionalName?: string;
  specialties?: string[];
  publicDescription?: string;
  peakLabel?: string;
};

export type PublicWeekAvailability = {
  partnerId: string;
  weekStartISO: string;
  sessions: PublicSession[];
  updatedAt: string; // ISO
};

const STORAGE_KEY_PREFIX = "fitlife-public-availability";

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function keyFor(partnerId: string, weekStartISO: string): string {
  return `${STORAGE_KEY_PREFIX}-${partnerId}-${weekStartISO}`;
}

export function getStoredPublicWeekAvailability(
  partnerId: string,
  weekStartISO: string
): PublicWeekAvailability | null {
  const raw = safeParse<PublicWeekAvailability | null>(keyFor(partnerId, weekStartISO), null);
  if (!raw || typeof raw !== "object") return null;
  if (raw.partnerId !== partnerId) return null;
  if (raw.weekStartISO !== weekStartISO) return null;
  if (!Array.isArray(raw.sessions)) return null;
  return raw;
}

export function setStoredPublicWeekAvailability(av: PublicWeekAvailability): void {
  safeSet(keyFor(av.partnerId, av.weekStartISO), av);
}

export function isoYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function startOfWeekMonday(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function addDays(ymd: string, days: number): string {
  const d = new Date(ymd + "T12:00:00");
  d.setDate(d.getDate() + days);
  return isoYMD(d);
}

/**
 * Customer app integration: get public sessions for this partner
 * within [minISO, maxISO] inclusive (by week buckets).
 */
export function getPublicSessionsForPartnerRange(params: {
  partnerId: string;
  minISO: string;
  maxISO: string;
}): PublicSession[] {
  const { partnerId, minISO, maxISO } = params;
  const minWeek = isoYMD(startOfWeekMonday(new Date(minISO + "T12:00:00")));
  const maxWeek = isoYMD(startOfWeekMonday(new Date(maxISO + "T12:00:00")));
  const weeks: string[] = [];
  let w = minWeek;
  while (w <= maxWeek) {
    weeks.push(w);
    w = addDays(w, 7);
  }

  const out: PublicSession[] = [];
  for (const weekStartISO of weeks) {
    const av = getStoredPublicWeekAvailability(partnerId, weekStartISO);
    if (!av) continue;
    for (const s of av.sessions) {
      if (s.dateISO >= minISO && s.dateISO <= maxISO) out.push(s);
    }
  }
  return out.sort((a, b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time));
}

/** Convert public sessions to MockActivity for existing UI/booking flows. */
export function publicSessionsToMockActivities(sessions: PublicSession[]): MockActivity[] {
  return sessions.map((s, idx) => {
    const dateDMY = (() => {
      // Convert ISO to DD/MM/YYYY for existing display (MockActivity.date)
      const [y, m, d] = s.dateISO.split("-");
      return `${d}/${m}/${y}`;
    })();
    const act: MockActivity = {
      id: s.id || `pub-${idx}-${Date.now()}`,
      title: s.name,
      date: dateDMY,
      time: s.time,
      durationMinutes: s.durationMinutes,
      credits: s.credits,
      // IMPORTANT: spots is used as public availability in customer app.
      spots: Math.max(0, Math.floor(s.fitlifeSlots)),
      location: s.location,
      peakLabel: s.peakLabel,
      trainer:
        s.professionalName && s.specialties
          ? {
              name: s.professionalName,
              avatarSrc: undefined,
              specialties: s.specialties,
              location: s.location ?? "",
              bio: s.publicDescription,
            }
          : undefined,
    };
    return act;
  });
}

