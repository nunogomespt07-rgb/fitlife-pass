"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { CATEGORY_PARTNERS, getAllPartnersWithCategory, type PartnerType } from "@/lib/activitiesData";
import { defaultPeakWindows, getServiceCreditConfig, setServiceCreditConfig } from "@/lib/creditConfig";
import { deleteAdminPartner, normalizePartnerDraft, upsertAdminPartner } from "@/lib/adminPartners";

export default function AdminPartnerDetailPage() {
  const params = useParams() as { partnerId?: string | string[] };
  const partnerId = Array.isArray(params.partnerId) ? params.partnerId[0] : (params.partnerId ?? "");

  const partner = useMemo(() => getAllPartnersWithCategory().find((p) => p.id === partnerId) ?? null, [partnerId]);
  const serviceKey = useMemo(() => (partner ? (partner.categorySlug + ":" + partner.id) : ""), [partner]);
  const categories = useMemo(() => Object.entries(CATEGORY_PARTNERS).map(([slug, data]) => ({ slug, label: data.label })), []);

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
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(partner?.name ?? "");
  const [categorySlug, setCategorySlug] = useState(partner?.categorySlug ?? categories[0]?.slug ?? "yoga");
  const [partnerType, setPartnerType] = useState<PartnerType>(partner?.partnerType ?? "class_booking");
  const [location, setLocation] = useState(partner?.location ?? "");
  const [city, setCity] = useState(partner?.city ?? "");
  const [address, setAddress] = useState(partner?.address ?? "");
  const [description, setDescription] = useState(partner?.description ?? "");
  const [openingHours, setOpeningHours] = useState(partner?.openingHours ?? "");
  const [fitlifePassHours, setFitlifePassHours] = useState(partner?.fitlifePassHours ?? "");
  const [isActive, setIsActive] = useState(partner?.isActive !== false);

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
          Dados do parceiro (editável)
        </p>
        <p className="mt-2 text-sm text-white/70">
          Gestão demo: alterações persistem localmente e passam a ser fonte de verdade para o customer app.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Nome</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Categoria</p>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-[#020617]">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Tipo de parceiro</p>
            <select
              value={partnerType}
              onChange={(e) => setPartnerType(e.target.value as PartnerType)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            >
              <option value="class_booking" className="bg-[#020617]">Classes/Sessões</option>
              <option value="gym_access" className="bg-[#020617]">Acesso ginásio</option>
              <option value="pool_access" className="bg-[#020617]">Acesso piscina</option>
              <option value="court_booking" className="bg-[#020617]">Campos (padel)</option>
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Localização (headline)</p>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Cidade</p>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Morada</p>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Descrição</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-3 min-h-[90px] w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Horário (exibição)</p>
            <input
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Horário FitLife Pass</p>
            <input
              value={fitlifePassHours}
              onChange={(e) => setFitlifePassHours(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              id="partner-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border border-white/20 bg-white/5"
            />
            <label htmlFor="partner-active" className="text-sm text-white/80">
              Ativo/visível
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              deleteAdminPartner(partnerId);
              window.location.assign("/admin/parceiros");
            }}
            className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100 hover:bg-red-500/15"
          >
            Remover parceiro
          </button>
          <PrimaryButton
            variant="appPrimary"
            className="rounded-xl py-3 text-sm font-semibold"
            onClick={() => {
              setError(null);
              const record = normalizePartnerDraft({
                id: partnerId,
                name,
                categorySlug,
                partnerType,
                location,
                city,
                address,
                description,
                openingHours,
                fitlifePassHours,
                minCredits: partner.minCredits,
                isActive,
              });
              if (!record) {
                setError("Nome e categoria são obrigatórios.");
                return;
              }
              upsertAdminPartner(record);
              setMsg("Guardado.");
              setTimeout(() => setMsg(null), 2000);
            }}
          >
            Guardar dados
          </PrimaryButton>
        </div>
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

