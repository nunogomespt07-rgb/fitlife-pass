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

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function joinName(firstName?: string | null, lastName?: string | null): string {
  const f = (firstName ?? "").trim();
  const l = (lastName ?? "").trim();
  return [f, l].filter(Boolean).join(" ");
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed.id !== "string") return null;
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
      trainingFrequency: parsed.trainingFrequency == null ? null : String(parsed.trainingFrequency),
      objective: parsed.objective == null ? null : String(parsed.objective),
      fitnessGoal: parsed.fitnessGoal == null ? null : String(parsed.fitnessGoal),
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

export function setStoredUser(user: Partial<StoredUser>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredUser();
    const nextFirstName =
      user.firstName !== undefined ? user.firstName : current?.firstName ?? null;
    const nextLastName =
      user.lastName !== undefined ? user.lastName : current?.lastName ?? null;
    const merged: StoredUser = {
      id: user.id ?? current?.id ?? "",
      name:
        user.name ?? current?.name ?? joinName(nextFirstName, nextLastName),
      email: user.email ?? current?.email ?? "",
      firstName: nextFirstName,
      lastName: nextLastName,
      city: user.city !== undefined ? user.city : current?.city ?? null,
      phone: user.phone !== undefined ? user.phone : current?.phone ?? null,
      address: user.address !== undefined ? user.address : current?.address ?? null,
      postalCode: user.postalCode !== undefined ? user.postalCode : current?.postalCode ?? null,
      country: user.country !== undefined ? user.country : current?.country ?? null,
      preferredActivities:
        user.preferredActivities !== undefined ? user.preferredActivities : current?.preferredActivities,
      trainingFrequency:
        user.trainingFrequency !== undefined ? user.trainingFrequency : current?.trainingFrequency ?? null,
      objective: user.objective !== undefined ? user.objective : current?.objective ?? null,
      fitnessGoal: user.fitnessGoal !== undefined ? user.fitnessGoal : current?.fitnessGoal ?? null,
      subscriptionPlanId: user.subscriptionPlanId !== undefined ? user.subscriptionPlanId : current?.subscriptionPlanId ?? null,
      subscriptionPlanName: user.subscriptionPlanName !== undefined ? user.subscriptionPlanName : current?.subscriptionPlanName ?? null,
      pendingPlanId: user.pendingPlanId !== undefined ? user.pendingPlanId : current?.pendingPlanId ?? null,
      pendingPlanName: user.pendingPlanName !== undefined ? user.pendingPlanName : current?.pendingPlanName ?? null,
      credits: user.credits !== undefined ? user.credits : current?.credits,
      profileCompleted: user.profileCompleted !== undefined ? user.profileCompleted : current?.profileCompleted,
      dateOfBirth: user.dateOfBirth !== undefined ? user.dateOfBirth : current?.dateOfBirth ?? null,
      nif: user.nif !== undefined ? user.nif : current?.nif ?? null,
      isForeign: user.isForeign !== undefined ? user.isForeign : current?.isForeign,
      acceptedTerms: user.acceptedTerms !== undefined ? user.acceptedTerms : current?.acceptedTerms,
      acceptedTermsAt: user.acceptedTermsAt !== undefined ? user.acceptedTermsAt : current?.acceptedTermsAt ?? null,
      acceptedPrivacy: user.acceptedPrivacy !== undefined ? user.acceptedPrivacy : current?.acceptedPrivacy,
      acceptedAgeConfirmation: user.acceptedAgeConfirmation !== undefined ? user.acceptedAgeConfirmation : current?.acceptedAgeConfirmation,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function getStoredUserDisplayName(): string {
  const u = getStoredUser();
  const firstName = u?.firstName?.trim();
  if (firstName) return firstName;
  const first = u?.name?.trim().split(/\s+/)[0];
  return first || "";
}
