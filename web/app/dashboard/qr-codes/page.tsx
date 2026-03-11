"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getMe, type MeUser } from "@/lib/api";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import GlassCard from "../../components/ui/GlassCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import ReservationQRModal from "../../components/ui/ReservationQRModal";
import type { UnifiedReservation } from "@/lib/unifiedReservations";

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function QRCodesPage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { reservations, cancelReservation } = useMockReservations();
  const [qrModalReservation, setQrModalReservation] = useState<UnifiedReservation | null>(null);
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const activityReservations = useMemo(
    () =>
      reservations.filter(
        (r) =>
          r.type === "activity" &&
          r.status === "confirmed" &&
          r.date >= todayYMD()
      ),
    [reservations]
  );

  useEffect(() => {
    let alive = true;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
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
  }, []);

  function handleCancel(id: string) {
    const r = reservations.find((x) => x.id === id);
    if (!r) return;
    setCancelLoadingId(id);
    setSuccessMessage("");
    cancelReservation(id);
    const refundMsg =
      r.type === "activity" && r.creditsUsed > 0
        ? ` ${r.creditsUsed} crédito(s) devolvido(s).`
        : "";
    setSuccessMessage(`Reserva cancelada.${refundMsg}`);
    setTimeout(() => setSuccessMessage(""), 5000);
    setCancelLoadingId(null);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-8 pb-16">
        <p className="text-white/60">A carregar…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-12 pt-2 sm:px-6 lg:px-10">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
          FitLife Pass · QR Codes
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Reservas com QR Code
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/70">
          Acesso rápido às reservas ativas. Apresenta o QR code no parceiro para fazer check-in.
        </p>
      </header>

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3.5 text-sm text-emerald-100">
          {successMessage}
        </div>
      )}

      {activityReservations.length === 0 ? (
        <GlassCard
          variant="dark"
          padding="lg"
          className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-center backdrop-blur-xl"
        >
          <p className="font-medium text-white/80">Não tens reservas ativas com QR code.</p>
          <p className="mt-2 text-sm text-white/60">
            Faz uma reserva em Atividades para ver os teus QR codes aqui.
          </p>
          <Link href="/activities" className="mt-6">
            <PrimaryButton variant="secondary" className="py-3.5">
              Ver atividades →
            </PrimaryButton>
          </Link>
        </GlassCard>
      ) : (
        <ul className="space-y-5">
          {activityReservations.map((r) => (
            <li key={r.id}>
              <GlassCard
                variant="dark"
                padding="md"
                hover
                active
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">
                    {r.activityTitle ?? r.partnerName}
                  </p>
                  <p className="mt-1 text-sm text-white/60">{r.partnerName}</p>
                  <p className="mt-0.5 text-xs text-white/50">
                    {r.date} · {r.time}
                    {r.location ? ` · ${r.location}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => setQrModalReservation(r)}
                    className="rounded-xl border border-white/[0.2] bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.12] hover:text-white active:scale-[0.98]"
                  >
                    Ver QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancel(r.id)}
                    disabled={cancelLoadingId === r.id}
                    className="rounded-xl border border-white/[0.2] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.1] hover:text-white disabled:opacity-60 active:scale-[0.98]"
                  >
                    {cancelLoadingId === r.id ? "A cancelar…" : "Cancelar reserva"}
                  </button>
                </div>
              </GlassCard>
            </li>
          ))}
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
