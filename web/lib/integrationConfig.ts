/**
 * Modo temporário: dados já visíveis na app tratados como válidos no backend
 * (requer USE_EXISTING_APP_DATA_AS_REAL no Express + NEXT_PUBLIC_USE_EXISTING_APP_DATA_AS_REAL no Next).
 */
export function isUseExistingAppDataAsReal(): boolean {
  const v = (process.env.NEXT_PUBLIC_USE_EXISTING_APP_DATA_AS_REAL || "").trim().toLowerCase();
  if (!v) return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return v === "true" || v === "1" || v === "yes";
}
