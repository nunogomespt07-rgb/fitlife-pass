"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";
import { defaultPeakWindows, getServiceCreditConfig, setServiceCreditConfig } from "@/lib/creditConfig";

export default function AdminPartnerDetailPage() {
  const params = useParams() as { partnerId?: string | string[] };
  const partnerId = Array.isArray(params.partnerId) ? params.partnerId[0] : (params.partnerId ?? "");

  const partner = useMemo(() => getAllPartnersWithCategory().find((p) => p.id === partnerId) ?? null, [partnerId]);
  const serviceKey = useMemo(() => (partner ? (partner.categorySlug + ":" + partner.id) : ""), [partner]);

  const initial = useMemo(() => {
    const off = partner?.minCredits ?? 8;
    return getServiceCreditConfig({
      partnerId,
      serviceKey,
      fallbackOffPeakCredits: off,
      fallbackPeakCredits: Math.max(off, off + 2),
    });
  }, [partnerId, serviceKey, partner?.minCredits]);

  const [offPeakCredits, setOffPeakCredits] = useState(initial.offPeakCredits);
  const [peakCredits, setPeakCredits] = useState(initial.peakCredits);
  const [peakStart, setPeakStart] = useState(initial.peakWindows[0]?.start ?? "17:00");
  const [peakEnd, setPeakEnd] = useState(initial.peakWindows[0]?.end ?? "21:00");
  const [msg, setMsg] = useState<string | null>(null);

  if (!partner) {
    return (
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <p className="text-sm text-white/75">Parceiro não encontrado.</p>
      </GlassCard>
    );
  }

  return (
    <div>
      <GlassCard variant="app" padding="lg" className="border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
          Parceiro
        </p>
        <p className="mt-2 text-xl font-semibold text-white">{partner.name}</p>
        <p className="mt-1 text-sm text-white/70">{partner.categoryLabel} · {partner.location}</p>
      </GlassCard>

      <GlassCard variant="app" padding="lg" className="mt-6 border-white/10">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
          Créditos (apenas peak / off-peak)
        </p>
        <p className="mt-2 text-sm text-white/70">
          O parceiro não pode editar créditos. Esta configuração é controlada pela plataforma/admin.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Off-peak</p>
            <input
              inputMode="numeric"
              value={offPeakCredits}
              onChange={(e) => setOffPeakCredits(Number(e.target.value))}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Peak</p>
            <input
              inputMode="numeric"
              value={peakCredits}
              onChange={(e) => setPeakCredits(Number(e.target.value))}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Janela peak (início)</p>
            <input
              type="time"
              value={peakStart}
              onChange={(e) => setPeakStart(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Janela peak (fim)</p>
            <input
              type="time"
              value={peakEnd}
              onChange={(e) => setPeakEnd(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {msg ? <span className="text-sm text-white/70">{msg}</span> : <span />}
          <PrimaryButton
            variant="appPrimary"
            className="rounded-xl py-3 text-sm font-semibold"
            onClick={() => {
              setServiceCreditConfig({
                partnerId,
                serviceKey,
                config: {
                  offPeakCredits,
                  peakCredits,
                  peakWindows: [{ ...defaultPeakWindows()[0], start: peakStart, end: peakEnd }],
                },
              });
              setMsg("Guardado.");
              setTimeout(() => setMsg(null), 2000);
            }}
          >
            Guardar
          </PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}

