"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMe, type MeUser } from "@/lib/api";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import GlassCard from "../../components/ui/GlassCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import ReservationQRModal from "../../components/ui/ReservationQRModal";
import type { UnifiedReservation } from "@/lib/unifiedReservations";
import { isGymQrExpired, canCancelReservation } from "@/lib/unifiedReservations";
import { useSession } from "next-auth/react";

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function QRCodesPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { reservations, cancelReservation } = useMockReservations();
  const [qrModalReservation, setQrModalReservation] = useState<UnifiedReservation | null>(null);
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const qrEligibleReservations = useMemo(
    () =>
      reservations.filter((r) => {
        if (r.status !== "confirmed") return false;
        if (r.type === "gym") return !isGymQrExpired(r);
        if (r.type === "activity") return r.date >= todayYMD();
        return false;
      }),
    [reservations]
  );

  useEffect(() => {
    let alive = true;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      // If user is logged via NextAuth, still allow the page to load using mock reservations.
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const userData = await getMe(token);
        if (!alive) return;
        setUser(userData);
        try {
          localStorage.setItem(
            "fitlife-user",
            JSON.stringify({
              id: userData._id,
              name: userData.name,
              email: userData.email,
            })
          );
        } catch {}
      } catch {
        if (!alive) return;
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [session]);

  function handleCancel(id: string) {
    const r = reservations.find((x) => x.id === id);
    if (!r) return;
    setCancelLoadingId(id);
    setSuccessMessage("");
    setErrorMessage("");
    const result = cancelReservation(id);
    setCancelLoadingId(null);
    if (result.success) {
      const refundMsg =
        r.type === "activity" && r.creditsUsed > 0
          ? ` ${r.creditsUsed} crédito(s) devolvido(s).`
          : "";
      setSuccessMessage(`Reserva cancelada.${refundMsg}`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } else {
      setErrorMessage(result.error ?? "Não foi possível cancelar.");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-8 pb-16">
        <p className="text-white/60">A carregar…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
          FitLife Pass · QR Codes
        </p>
        <h1 className="app-hero-title mt-4 text-white sm:text-4xl">
          Reservas com QR Code
        </h1>
        <p className="mt-3 max-w-xl text-[15px] text-white/65">
          Acesso rápido às reservas ativas. Apresenta o QR code no parceiro para fazer check-in.
        </p>
      </header>

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3.5 text-[15px] text-emerald-100">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-3.5 text-[15px] text-amber-100">
          {errorMessage}
        </div>
      )}

      {qrEligibleReservations.length === 0 ? (
        <GlassCard
          variant="app"
          padding="lg"
          className="flex min-h-[260px] flex-col items-center justify-center text-center"
        >
          <p className="font-medium text-white/90">Não tens reservas ativas com QR code.</p>
          <p className="mt-2 text-[15px] text-white/65">
            Faz uma reserva em Atividades para ver os teus QR codes aqui.
          </p>
          <Link href="/activities" className="mt-6">
            <PrimaryButton variant="appSecondary" className="py-3.5">
              Ver atividades →
            </PrimaryButton>
          </Link>
        </GlassCard>
      ) : (
        <ul className="space-y-5">
          {qrEligibleReservations.map((r) => {
            const canCancel = canCancelReservation(r);
            const isGym = r.type === "gym";
            return (
              <li key={r.id}>
                <GlassCard
                  variant="app"
                  padding="md"
                  hover
                  active
                  activityStyle
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="app-card-title text-white">
                      {isGym ? "Acesso ginásio" : (r.activityTitle ?? r.partnerName)}
                    </p>
                    <p className="mt-1 text-[15px] text-white/65">{r.partnerName}</p>
                    <p className="mt-0.5 text-xs text-white/55">
                      {r.date} · {r.time}
                      {isGym ? " · Válido 8h" : r.location ? ` · ${r.location}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => setQrModalReservation(r)}
                      className="app-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
                    >
                      Ver QR Code
                    </button>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancel(r.id)}
                        disabled={cancelLoadingId === r.id}
                        className="app-btn-secondary rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                      >
                        {cancelLoadingId === r.id ? "A cancelar…" : "Cancelar reserva"}
                      </button>
                    )}
                    {!canCancel && !isGym && (
                      <p className="text-xs text-white/55">Cancelação indisponível (&lt; 6h)</p>
                    )}
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}

      {qrModalReservation && (
        <ReservationQRModal
          reservation={qrModalReservation}
          onClose={() => setQrModalReservation(null)}
        />
      )}
    </div>
  );
}
