export type PeakWindow = {
  /** 1=Mon ... 7=Sun */
  days: number[];
  start: string; // HH:MM
  end: string; // HH:MM
};

export type ServiceCreditConfig = {
  offPeakCredits: number;
  peakCredits: number;
  peakWindows: PeakWindow[];
};

type StoredConfig = {
  /** partnerId -> serviceKey -> config */
  byPartner: Record<string, Record<string, ServiceCreditConfig>>;
};

const STORAGE_KEY = "fitlife-admin-credit-config";

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

function clampInt(n: unknown, min: number, max: number): number {
  const x = Math.floor(Number(n));
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function dayOfWeekMon1(dateISO: string): number {
  const d = new Date(dateISO + "T12:00:00");
  const day = d.getDay(); // 0=Sun
  return day === 0 ? 7 : day; // 1..7
}

function minutes(hhmm: string): number | null {
  const [h, m] = String(hhmm).split(":").map((x) => parseInt(x, 10));
  if (![h, m].every((n) => Number.isFinite(n))) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function isInWindow(dateISO: string, timeHHMM: string, w: PeakWindow): boolean {
  const dow = dayOfWeekMon1(dateISO);
  if (!w.days.includes(dow)) return false;
  const t = minutes(timeHHMM);
  const s = minutes(w.start);
  const e = minutes(w.end);
  if (t == null || s == null || e == null) return false;
  if (e <= s) return false;
  return t >= s && t < e;
}

export function defaultPeakWindows(): PeakWindow[] {
  // Weekdays 17:00–21:00 (simple, safe default)
  return [{ days: [1, 2, 3, 4, 5], start: "17:00", end: "21:00" }];
}

export function getAllCreditConfig(): StoredConfig {
  return safeParse<StoredConfig>(STORAGE_KEY, { byPartner: {} });
}

export function getServiceCreditConfig(params: {
  partnerId: string;
  serviceKey: string;
  fallbackOffPeakCredits: number;
  fallbackPeakCredits: number;
}): ServiceCreditConfig {
  const { partnerId, serviceKey, fallbackOffPeakCredits, fallbackPeakCredits } = params;
  const store = getAllCreditConfig();
  const cfg = store.byPartner?.[partnerId]?.[serviceKey];
  if (cfg) {
    return {
      offPeakCredits: clampInt(cfg.offPeakCredits, 0, 999),
      peakCredits: clampInt(cfg.peakCredits, 0, 999),
      peakWindows: Array.isArray(cfg.peakWindows) && cfg.peakWindows.length > 0 ? cfg.peakWindows : defaultPeakWindows(),
    };
  }
  return {
    offPeakCredits: clampInt(fallbackOffPeakCredits, 0, 999),
    peakCredits: clampInt(fallbackPeakCredits, 0, 999),
    peakWindows: defaultPeakWindows(),
  };
}

export function setServiceCreditConfig(params: {
  partnerId: string;
  serviceKey: string;
  config: ServiceCreditConfig;
}): void {
  const { partnerId, serviceKey, config } = params;
  const store = getAllCreditConfig();
  const next: StoredConfig = {
    ...store,
    byPartner: {
      ...store.byPartner,
      [partnerId]: {
        ...(store.byPartner[partnerId] ?? {}),
        [serviceKey]: {
          offPeakCredits: clampInt(config.offPeakCredits, 0, 999),
          peakCredits: clampInt(config.peakCredits, 0, 999),
          peakWindows: Array.isArray(config.peakWindows) && config.peakWindows.length > 0 ? config.peakWindows : defaultPeakWindows(),
        },
      },
    },
  };
  safeSet(STORAGE_KEY, next);
}

export function computeCreditsForSlot(params: {
  partnerId: string;
  serviceKey: string;
  dateISO: string;
  timeHHMM: string;
  fallbackOffPeakCredits: number;
  fallbackPeakCredits: number;
}): { credits: number; peak: boolean } {
  const cfg = getServiceCreditConfig(params);
  const peak = cfg.peakWindows.some((w) => isInWindow(params.dateISO, params.timeHHMM, w));
  return { credits: peak ? cfg.peakCredits : cfg.offPeakCredits, peak };
}

