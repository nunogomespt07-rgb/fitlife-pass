"use client";

import { useEffect } from "react";
import QRCode from "react-qr-code";
import type { Partner } from "@/lib/activitiesData";
import GlassCard from "./GlassCard";

type GymEntryQRModalProps = {
  partner: Partner;
  onClose: () => void;
};

/** Unique payload for gym entry (demo: reception scans to validate access). */
function getGymEntryPayload(partnerId: string): string {
  const ts = Date.now();
  return `fitlife-gym-entry:${partnerId}:${ts}`;
}

export default function GymEntryQRModal({ partner, onClose }: GymEntryQRModalProps) {
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

  const credits = partner.creditsPerEntry ?? partner.minCredits ?? 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gym-qr-modal-title"
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
        <h2 id="gym-qr-modal-title" className="text-xl font-semibold tracking-tight text-white">
          QR Code de entrada
        </h2>
        <p className="mt-1 text-sm text-white/70">{partner.name}</p>
        <p className="mt-1 text-xs text-white/60">
          {credits} crédito{credits !== 1 ? "s" : ""} por entrada
        </p>
        <p className="mt-2">
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-200">
            válido para entrada
          </span>
        </p>

        <div className="mt-8 flex justify-center rounded-2xl border border-white/10 bg-white p-6">
          <QRCode
            value={getGymEntryPayload(partner.id)}
            size={200}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="M"
            title={`Entrada: ${partner.name}`}
          />
        </div>
        <p className="mt-4 text-center text-sm font-medium text-white/90">
          Apresenta este QR code na receção para registar a tua entrada.
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
