/**
 * Remove caches locais de reservas/créditos por utilizador (demo/visitante).
 * Chamar após registo ou quando se quer estado limpo antes de gravar o utilizador da API.
 */
export function clearFitlifeLocalDemoCaches(): void {
  if (typeof window === "undefined") return;
  try {
    const legacy = [
      "fitlife-reservations",
      "fitlife-history",
      "fitlife-restaurant-reservations",
      "fitlife-restaurant-history",
      "fitlife-unified-reservations",
      "fitlife-credits",
    ];
    legacy.forEach((k) => localStorage.removeItem(k));

    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (
        k.startsWith("fitlife-unified-reservations-") ||
        k.startsWith("fitlife-purchased-credits-") ||
        k.startsWith("fitlife-cancellation-count-")
      ) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
