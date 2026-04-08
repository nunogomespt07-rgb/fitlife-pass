"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GlassCard from "../../../components/ui/GlassCard";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import FavoriteButton from "../../../components/ui/FavoriteButton";
import SectionHeader from "../../../components/ui/SectionHeader";
import { useFavorites } from "@/app/context/FavoritesContext";

export default function ActivityCategoryPage() {
  const params = useParams() as { slug?: string | string[] };
  const rawSlug = params.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug ?? "";

  const { toggleActivityPartner, isActivityPartnerFavorite } = useFavorites();
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/partners`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar parceiros");
        return res.json();
      })
      .then((data) => {
        const filtered = Array.isArray(data)
          ? data.filter((p) => p.categorySlug === slug)
          : [];
        setPartners(filtered);
      })
      .catch(() => setError("Erro ao carregar parceiros."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="text-white font-sans min-h-screen flex items-center justify-center">
        <span>A carregar parceiros…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white font-sans min-h-screen flex items-center justify-center">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="text-white font-sans min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <Link
          href="/activities"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
        >
          ← Voltar às atividades
        </Link>

        <div className="mt-8">
          <SectionHeader
            variant="app"
            title={slug.charAt(0).toUpperCase() + slug.slice(1)}
            subtitle={slug === "personal-training"
              ? "Escolhe um personal trainer para ver sessões e disponibilidade."
              : "Escolhe um parceiro para ver as atividades disponíveis."}
          />
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            partner._id ? (
              <GlassCard
                key={partner._id}
                variant="app"
                padding="none"
                hover
                activityStyle
                className="flex flex-col overflow-hidden transition duration-[180ms] hover:translate-y-[-2px]"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={partner.imageSrc || partner.image}
                    alt={partner.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />
                  <div className="absolute right-3 top-3">
                    <FavoriteButton
                      isFavorite={isActivityPartnerFavorite(slug, partner._id)}
                      onToggle={() => toggleActivityPartner(slug, partner._id, partner.categoryLabel || slug, partner.name)}
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="app-card-title text-white">
                    {partner.name}
                  </h3>
                  <p className="mt-1 text-[15px] font-medium text-white/70">
                    {partner.city || partner.location}
                  </p>
                  <p className="mt-3 flex-1 text-[13px] text-white/75">
                    {partner.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-white/80">
                    {partner.activitiesCount && <span>{partner.activitiesCount} atividades</span>}
                  </div>
                  <Link
                    href={`/activities/categorias/${slug}/parceiros/${partner._id}`}
                    className="mt-5 block"
                  >
                    <PrimaryButton
                      variant="appSecondary"
                      className="w-full justify-center"
                    >
                      Ver atividades
                    </PrimaryButton>
                  </Link>
                </div>
              </GlassCard>
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
}

