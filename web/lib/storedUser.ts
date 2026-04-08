/**
 * Single source of truth for the user object stored in localStorage (fitlife-user).
 * Used by Nav, dashboard, onboarding, and login/register.
 */

export type StoredUser = {
  id: string;
  /** Prefer `firstName` + `lastName`. Kept for backward compatibility. */
  name: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  phone?: string | null;
  /** Morada / endereço */
  address?: string | null;
  postalCode?: string | null;
  country?: string | null;
  /** Onboarding preferences (demo/local) */
  preferredActivities?: string[];
  trainingFrequency?: string | null;
  objective?: string | null;
  /** Objetivo fitness */
  fitnessGoal?: string | null;
  /** Objetivo principal (onboarding pós-registo) */
  primaryGoal?: string | null;
  experienceLevel?: string | null;
  preferredTrainingTimes?: string[];
  healthyFoodInterest?: string | null;
  /** Concluído o onboarding de preferências após primeiro registo */
  onboardingCompleted?: boolean;
  /** Interesses de categorias (ids alinhados com onboarding / Mongo `interests`). */
  interests?: string[];
  /** Active only after payment success. */
  subscriptionPlanId?: string | null;
  subscriptionPlanName?: string | null;
  /** Selected in onboarding but not yet paid — do not treat as active. */
  pendingPlanId?: string | null;
  pendingPlanName?: string | null;
  credits?: number;
  /** Profile completion step (Nome, Data nascimento, NIF) done once. */
  profileCompleted?: boolean;
  dateOfBirth?: string | null;
  nif?: string | null;
  isForeign?: boolean;
  /** Legal acceptance at registration. */
  acceptedTerms?: boolean;
  acceptedTermsAt?: string | null;
  acceptedPrivacy?: boolean;
  acceptedAgeConfirmation?: boolean;
};

const STORAGE_KEY = "fitlife-user";

/** Usado no perfil e no parse de `name` legado. */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function joinName(firstName?: string | null, lastName?: string | null): string {
  const f = (firstName ?? "").trim();
  const l = (lastName ?? "").trim();
  return [f, l].filter(Boolean).join(" ");
}

/**
 * Merge seguro: nunca sobrescreve com null ou undefined (dados esparsos da API/sessão).
 * Strings vazias "" aplicam-se (ex.: limpar telefone no perfil). Quem não deve apagar nome
 * vazio (ex. Nav OAuth) não deve passar a chave `name` ou usar string vazia.
 * `0` e `false` são aplicados (créditos / flags).
 */
export function safeMerge<T extends Record<string, unknown>>(oldUser: T, newData: Partial<T>): T {
  return {
    ...oldUser,
    ...Object.fromEntries(
      Object.entries(newData as Record<string, unknown>).filter(([_, v]) => {
        if (v === null || v === undefined) return false;
        if (typeof v === "number" && Number.isNaN(v)) return false;
        return true;
      })
    ),
  } as T;
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed.id !== "string" || !String(parsed.id).trim()) return null;
    const rawName = typeof parsed.name === "string" ? parsed.name : "";
    const parsedFirstName = parsed.firstName == null ? null : String(parsed.firstName);
    const parsedLastName = parsed.lastName == null ? null : String(parsed.lastName);
    const derived =
      rawName.trim().length > 0 ? splitFullName(rawName) : { firstName: "", lastName: "" };
    const firstName = parsedFirstName ?? derived.firstName;
    const lastName = parsedLastName ?? derived.lastName;
    const name = rawName.trim() ? rawName : joinName(firstName, lastName);
    return {
      id: parsed.id,
      name,
      email: typeof parsed.email === "string" ? parsed.email : "",
      firstName: firstName || null,
      lastName: lastName || null,
      city: parsed.city == null ? null : String(parsed.city),
      phone: parsed.phone == null ? null : String(parsed.phone),
      address: parsed.address == null ? null : String(parsed.address),
      postalCode: parsed.postalCode == null ? null : String(parsed.postalCode),
      country: parsed.country == null ? null : String(parsed.country),
      preferredActivities: Array.isArray(parsed.preferredActivities)
        ? (parsed.preferredActivities.map(String) as string[])
        : undefined,
      interests: Array.isArray(parsed.interests)
        ? (parsed.interests.map(String) as string[])
        : undefined,
      trainingFrequency: parsed.trainingFrequency == null ? null : String(parsed.trainingFrequency),
      objective: parsed.objective == null ? null : String(parsed.objective),
      fitnessGoal: parsed.fitnessGoal == null ? null : String(parsed.fitnessGoal),
      primaryGoal: parsed.primaryGoal == null ? null : String(parsed.primaryGoal),
      experienceLevel: parsed.experienceLevel == null ? null : String(parsed.experienceLevel),
      preferredTrainingTimes: Array.isArray(parsed.preferredTrainingTimes)
        ? (parsed.preferredTrainingTimes.map(String) as string[])
        : undefined,
      healthyFoodInterest:
        parsed.healthyFoodInterest == null ? null : String(parsed.healthyFoodInterest),
      onboardingCompleted:
        parsed.onboardingCompleted === true
          ? true
          : parsed.onboardingCompleted === false
          ? false
          : undefined,
      subscriptionPlanId: parsed.subscriptionPlanId == null ? null : String(parsed.subscriptionPlanId),
      subscriptionPlanName: parsed.subscriptionPlanName == null ? null : String(parsed.subscriptionPlanName),
      pendingPlanId: parsed.pendingPlanId == null ? null : String(parsed.pendingPlanId),
      pendingPlanName: parsed.pendingPlanName == null ? null : String(parsed.pendingPlanName),
      credits: typeof parsed.credits === "number" && parsed.credits >= 0 ? parsed.credits : undefined,
      profileCompleted: parsed.profileCompleted === true,
      dateOfBirth: parsed.dateOfBirth == null ? null : String(parsed.dateOfBirth),
      nif: parsed.nif == null ? null : String(parsed.nif),
      isForeign: parsed.isForeign === true,
      acceptedTerms: parsed.acceptedTerms === true,
      acceptedTermsAt: parsed.acceptedTermsAt == null ? null : String(parsed.acceptedTermsAt),
      acceptedPrivacy: parsed.acceptedPrivacy === true,
      acceptedAgeConfirmation: parsed.acceptedAgeConfirmation === true,
    };
  } catch {
    return null;
  }
}

/**
 * Substitui o objeto em `fitlife-user` sem fundir com o anterior.
 * Usar após login/registo quando a fonte de verdade é a resposta da API (evita créditos/reservas “fantasma”).
 */
export function replaceStoredUser(user: StoredUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function setStoredUser(user: Partial<StoredUser>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredUser();
    const base = (current ?? {}) as StoredUser;
    const merged = safeMerge(base as unknown as Record<string, unknown>, user as Record<string, unknown>) as StoredUser;

    const nextId =
      user.id !== undefined && String(user.id).trim() !== ""
        ? String(user.id).trim()
        : merged.id?.trim() || current?.id?.trim() || "";

    const nextEmail =
      user.email !== undefined && String(user.email).trim() !== ""
        ? String(user.email).trim()
        : merged.email?.trim() || current?.email?.trim() || "";

    let nextName = merged.name?.trim() || "";
    const fn = merged.firstName?.trim() || "";
    const ln = merged.lastName?.trim() || "";
    if (!nextName && (fn || ln)) {
      nextName = joinName(merged.firstName, merged.lastName);
    }
    if (!nextName && nextEmail) {
      nextName = nextEmail.split("@")[0] || "";
    }

    const final: StoredUser = {
      ...merged,
      id: nextId,
      email: nextEmail,
      name: nextName,
      firstName: merged.firstName ?? null,
      lastName: merged.lastName ?? null,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(final));

    if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
      console.log("USER AFTER MERGE:", getStoredUser());
      console.log("CREDITS:", typeof window !== "undefined" ? localStorage.getItem("credits") : null);
    }
  } catch {
    // ignore
  }
}

/**
 * Nome legível (sem usar email). Para navbar/avatar usar `@/lib/navbarUserDisplay`.
 */
export function getStoredUserDisplayName(): string {
  const u = getStoredUser();
  if (!u) return "";
  return (
    u.name?.trim() ||
    `${(u.firstName ?? "").trim()} ${(u.lastName ?? "").trim()}`.trim() ||
    ""
  );
}
