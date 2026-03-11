\"use client\";

import { useEffect, useState } from \"react\";
import Link from \"next/link\";
import {
  getMe,
  getApiBookings,
  type MeUser,
  type ApiBooking,
} from \"@/lib/api\";
import GlassCard from \"../../components/ui/GlassCard\";
import DashboardCard from \"../../components/ui/DashboardCard\";
import SectionHeader from \"../../components/ui/SectionHeader\";

type BookingStatusFilter = \"upcoming\" | \"past\" | \"cancelled\";

function parseActivityDate(booking: ApiBooking): Date | null {
  const raw =
    booking.activity?.date ??
    booking.bookingDate ??
    booking.createdAt ??
    undefined;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function classifyStatus(booking: ApiBooking): BookingStatusFilter {
  if (booking.status === \"cancelled\") return \"cancelled\";
  const d = parseActivityDate(booking);
  if (!d) return \"upcoming\";
  const now = new Date();
  return d >= now ? \"upcoming\" : \"past\";
}

function formatDateTime(raw: string | undefined): string {
  if (!raw) return \"—\";
  try {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleString(\"pt-PT\", {
      dateStyle: \"short\",
      timeStyle: \"short\",
    });
  } catch {
    return raw;
  }
}

export default function ReservationsHistoryPage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(\"\");
  const [filter, setFilter] = useState<BookingStatusFilter>(\"upcoming\");

  useEffect(() => {
    let alive = true;
    const token =
      typeof window !== \"undefined\" ? localStorage.getItem(\"token\") : null;

    if (!token) {
      setError(\"Precisas de fazer login para ver o histórico de reservas.\");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(\"\");
        const [userData, bookingsData] = await Promise.all([
          getMe(token),
          getApiBookings(token),
        ]);
        if (!alive) return;
        setUser(userData);
        setBookings(bookingsData);
      } catch (e) {
        if (!alive) return;
        const err = e as Error & {
          data?: { message?: string };
          status?: number;
        };
        if (err?.status === 401) {
          setError(
            \"Sessão inválida ou expirada. Faz login novamente para ver o histórico.\",
          );
          if (typeof window !== \"undefined\") localStorage.removeItem(\"token\");
        } else {
          setError(
            err?.data &&
              typeof err.data === \"object\" &&
              typeof (err.data as { message?: string }).message === \"string\"
              ? (err.data as { message: string }).message
              : err?.message ?? \"Erro ao carregar o histórico de reservas\",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const firstName = user?.name?.split(/\\s+/)[0] ?? \"Utilizador\";

  const enriched = bookings
    .map((b) => ({
      booking: b,
      status: classifyStatus(b),
      activityDate: parseActivityDate(b),
    }))
    .sort((a, b) => {
      const da = a.activityDate?.getTime() ?? 0;
      const db = b.activityDate?.getTime() ?? 0;
      return db - da; // mais recente primeiro
    });

  const filtered = enriched.filter((item) => item.status === filter);

  if (loading) {
    return (
      <div className=\"page-bg font-sans\">
        <div className=\"mx-auto max-w-4xl px-4 pt-24 pb-16\">
          <p className=\"text-white/60\">A carregar reservas…</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className=\"page-bg font-sans\">
        <div className=\"mx-auto max-w-md px-4 pt-24 pb-12\">
          <GlassCard
            variant=\"dark\"
            padding=\"lg\"
            className=\"border-amber-500/20 bg-amber-500/10\"
          >
            <p className=\"font-medium text-white\">{error}</p>
            <Link
              href=\"/\"
              className=\"mt-4 inline-block text-sm font-medium text-amber-200 underline-offset-2 hover:underline\"
            >
              Ir para login
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className=\"page-bg text-white font-sans\">
      <div className=\"mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10\">
        <p className=\"text-xs font-semibold uppercase tracking-[0.24em] text-white/55\">
          FitLife Pass · Histórico
        </p>
        <h1 className=\"mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl\">
          Reservas de {firstName}
        </h1>

        <div className=\"mt-10 grid gap-6 sm:grid-cols-2\">
          <DashboardCard
            title=\"Total de reservas\"
            subtitle=\"Inclui futuras, passadas e canceladas\"
          >
            <p className=\"text-3xl font-semibold text-white\">
              {bookings.length}
            </p>
          </DashboardCard>
          <DashboardCard
            title=\"Navegar\"
            subtitle=\"Voltar ao dashboard\"
          >
            <Link href=\"/dashboard\">
              <span className=\"inline-flex items-center text-sm font-medium text-blue-100 underline-offset-2 hover:underline\">
                ← Voltar ao dashboard
              </span>
            </Link>
          </DashboardCard>
        </div>

        <SectionHeader
          title=\"Histórico de reservas\"
          subtitle=\"Consulta as tuas reservas passadas, futuras e canceladas.\"
          className=\"mt-16\"
        />

        {/* Filtros de estado */}
        <div className=\"mt-6 inline-flex rounded-full bg-white/[0.06] p-1.5\">
          {([
            { id: \"upcoming\", label: \"Próximas\" },
            { id: \"past\", label: \"Passadas\" },
            { id: \"cancelled\", label: \"Canceladas\" },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              type=\"button\"
              onClick={() => setFilter(opt.id)}
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all ${
                filter === opt.id
                  ? \"bg-white/20 text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.4)]\"
                  : \"text-white/60 hover:text-white/90\"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Lista de reservas filtradas */}
        {filtered.length === 0 ? (
          <GlassCard
            variant=\"dark\"
            padding=\"lg\"
            className=\"mt-8 flex min-h-[220px] flex-col items-center justify-center text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl\"
          >
            <p className=\"font-medium text-white/80\">
              Sem reservas neste filtro
            </p>
            <p className=\"mt-2 text-sm text-white/55\">
              Altera o filtro acima ou explora atividades para fazer uma nova reserva.
            </p>
            <Link href=\"/activities\">
              <span className=\"mt-5 inline-flex items-center text-sm font-medium text-blue-100 underline-offset-2 hover:underline\">
                Ver atividades →
              </span>
            </Link>
          </GlassCard>
        ) : (
          <ul className=\"mt-8 space-y-5\">
            {filtered.map(({ booking, status, activityDate }) => {
              const activity = booking.activity;
              const partnerName =
                (activity as any)?.partnerName ?? activity?.location ?? \"—\";
              const when =
                activity?.date ??
                booking.bookingDate ??
                booking.createdAt ??
                undefined;

              return (
                <li key={booking._id}>
                  <GlassCard
                    variant=\"dark\"
                    padding=\"md\"
                    hover
                    className=\"flex flex-col gap-3\"
                  >
                    <div className=\"flex flex-wrap items-start justify-between gap-3\">
                      <div>
                        <p className=\"font-semibold text-white\">
                          {activity?.title ?? \"Atividade\"}
                        </p>
                        <p className=\"mt-1 text-xs text-white/60\">
                          {activity?.sportType ?? \"—\"} · {partnerName}
                        </p>
                        <p className=\"mt-0.5 text-xs text-white/50\">
                          {formatDateTime(when)}
                        </p>
                      </div>
                      <div className=\"flex flex-col items-end gap-2\">
                        <span className=\"rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white\">
                          {booking.creditsUsed} crédito(s)
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                            status === \"upcoming\"
                              ? \"bg-emerald-400/15 text-emerald-200 border border-emerald-300/30\"
                              : status === \"past\"
                              ? \"bg-white/10 text-white/80 border border-white/20\"
                              : \"bg-red-500/15 text-red-200 border border-red-300/30\"
                          }`}
                        >
                          {status === \"upcoming\"
                            ? \"Próxima\"
                            : status === \"past\"
                            ? \"Concluída\"
                            : \"Cancelada\"}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

