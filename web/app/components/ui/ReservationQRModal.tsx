"use client";

import { useEffect } from "react";
import QRCode from "react-qr-code";
import type { UnifiedReservation } from "@/lib/unifiedReservations";
import GlassCard from "./GlassCard";

type ReservationQRModalProps = {
  reservation: UnifiedReservation;
  onClose: () => void;
};

/** Unique check-in payload for this reservation (demo: partner scans to verify). */
function getCheckInPayload(reservation: UnifiedReservation): string {
  return `fitlife-checkin:${reservation.id}`;
}

export default function ReservationQRModal({ reservation, onClose }: ReservationQRModalProps) {
  const title = reservation.type === "activity" ? (reservation.activityTitle ?? reservation.partnerName) : reservation.partnerName;
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div
        className="absolute inset-0 bg-[#0b1e4d]/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <GlassCard
        variant="dark"
        padding="lg"
        className="relative z-10 w-full max-w-md rounded-3xl border-white/20 bg-white/10 shadow-2xl"
      >
        <h2 id="qr-modal-title" className="text-xl font-semibold tracking-tight text-white">
          Código QR da reserva
        </h2>
        <p className="mt-1 text-sm text-white/70">{title}</p>
        <p className="mt-0.5 text-xs text-white/60">{reservation.partnerName}</p>
        <p className="mt-2 text-xs text-white/50">
          {reservation.date} · {reservation.time}
        </p>
        <p className="mt-1">
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
            ativa
          </span>
        </p>
        <p className="mt-2 text-xs font-mono text-white/50">
          ID: {reservation.id}
        </p>

        <div className="mt-8 flex justify-center rounded-2xl border border-white/10 bg-white p-6">
          <QRCode
            value={getCheckInPayload(reservation)}
            size={200}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="M"
            title={`Check-in: ${title}`}
          />
        </div>
        <p className="mt-4 text-center text-sm font-medium text-white/90">
          Apresenta este QR code no parceiro para fazer check-in.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-xl border border-white/20 bg-white/10 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.98]"
        >
          Fechar
        </button>
      </GlassCard>
    </div>
  );
}
