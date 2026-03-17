"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { CATEGORY_PARTNERS, type PartnerType } from "@/lib/activitiesData";
import { normalizePartnerDraft, upsertAdminPartner } from "@/lib/adminPartners";

export default function AdminNewPartnerPage() {
  const router = useRouter();
  const categories = useMemo(() => Object.entries(CATEGORY_PARTNERS).map(([slug, data]) => ({ slug, label: data.label })), []);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "yoga");
  const [partnerType, setPartnerType] = useState<PartnerType>("class_booking");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [fitlifePassHours, setFitlifePassHours] = useState("");
  const [minCredits, setMinCredits] = useState(8);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <GlassCard variant="app" padding="lg" className="border-white/10 select-none cursor-default">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Novo parceiro</p>
        <p className="mt-2 text-sm text-white/70">
          Criação demo (persistência local). Não altera o look do customer app; apenas os dados.
        </p>
      </GlassCard>

      <GlassCard variant="app" padding="lg" className="mt-6 border-white/10">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">ID</p>
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="ex.: parceiro-novo-porto"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
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
              placeholder="ex.: Porto · Boavista"
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
              placeholder="ex.: 06:00 – 23:00"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Horário FitLife Pass</p>
            <input
              value={fitlifePassHours}
              onChange={(e) => setFitlifePassHours(e.target.value)}
              placeholder="ex.: 06:00 – 11:00, 14:00 – 17:00"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90 outline-none"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Créditos mínimos (fallback)</p>
            <input
              inputMode="numeric"
              value={minCredits}
              onChange={(e) => setMinCredits(Number(e.target.value))}
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
            onClick={() => router.push("/admin/parceiros")}
            className="text-sm font-medium text-white/70 underline-offset-2 hover:underline"
          >
            Cancelar
          </button>
          <PrimaryButton
            variant="appPrimary"
            className="rounded-xl py-3 text-sm font-semibold"
            onClick={() => {
              setError(null);
              const record = normalizePartnerDraft({
                id,
                name,
                categorySlug,
                partnerType,
                location,
                city,
                address,
                description,
                openingHours,
                fitlifePassHours,
                minCredits,
                isActive,
              });
              if (!record) {
                setError("Preenche pelo menos ID, Nome e Categoria.");
                return;
              }
              upsertAdminPartner(record);
              router.push(`/admin/parceiros/${record.id}`);
            }}
          >
            Criar parceiro
          </PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}

