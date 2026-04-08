/**
 * Labels da navbar/avatar: nunca usar email nem parte local do email como texto visível.
 */

export type NavbarUserLike = {
  firstName?: string | null;
  name?: string | null;
  lastName?: string | null;
} | null;

export function getFirstName(value: unknown): string {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  if (!cleaned) return "";
  if (cleaned.includes("@")) return "";
  return cleaned.split(/\s+/)[0] || "";
}

export function getSafeNavbarName(userLike: NavbarUserLike): string {
  const first =
    getFirstName(userLike?.firstName) ||
    getFirstName(userLike?.name);
  return first || "Conta";
}

export function getSafeNavbarInitial(userLike: NavbarUserLike): string {
  const label = getSafeNavbarName(userLike);
  return label && label !== "Conta" ? label.charAt(0).toUpperCase() : "U";
}
