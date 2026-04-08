/**
 * Proxy server-to-server Next → Express (admin).
 * Admin usa **apenas** BACKEND_API_URL (nunca NEXT_PUBLIC_* — não expor URL do API ao cliente).
 * Segredo: ADMIN_API_SECRET no header `x-admin-secret` (Express aceita também o legado).
 */

function trimBase(url: string | undefined): string {
  return (url ?? "").replace(/\/$/, "").trim();
}

/** Base do Express para rotas normais (bookings, reservas): BACKEND_API_URL → fallback NEXT_PUBLIC_API_URL. */
export function resolveBackendApiBase(): string {
  const a = trimBase(process.env.BACKEND_API_URL);
  if (a) return a;
  const b = trimBase(process.env.NEXT_PUBLIC_API_URL);
  if (b) return b;
  return "";
}

/**
 * Admin: **só** BACKEND_API_URL (variável de servidor no deploy do Next).
 */
export function resolveAdminBackendBase(): string {
  return trimBase(process.env.BACKEND_API_URL);
}

export function adminBackendConfigured(): boolean {
  const base = resolveAdminBackendBase();
  const secret = process.env.ADMIN_API_SECRET?.trim() ?? "";
  return Boolean(base && secret);
}

export async function fetchAdminBackend(pathAndQuery: string): Promise<Response> {
  const base = resolveAdminBackendBase();
  const secret = process.env.ADMIN_API_SECRET?.trim() ?? "";
  if (!base || !secret) {
    throw new Error(
      "BACKEND_API_URL e ADMIN_API_SECRET são necessários no servidor Next para o proxy admin"
    );
  }
  const url = pathAndQuery.startsWith("/") ? `${base}${pathAndQuery}` : `${base}/${pathAndQuery}`;
  return fetch(url, {
    headers: {
      "x-admin-secret": secret,
      /** Legado — mesmo valor; o Express aceita ambos. */
      "X-Fitlife-Admin-Secret": secret,
    },
    cache: "no-store",
  });
}
