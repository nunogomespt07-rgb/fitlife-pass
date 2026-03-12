"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CATEGORY_PARTNERS } from "../../../../lib/activitiesData";
import GlassCard from "../../../components/ui/GlassCard";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import FavoriteButton from "../../../components/ui/FavoriteButton";
import SectionHeader from "../../../components/ui/SectionHeader";
import { useFavorites } from "@/app/context/FavoritesContext";

export default function ActivityCategoryPage() {
  const params = useParams() as { slug?: string | string[] };
  const rawSlug = params.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug ?? "";

  const category = CATEGORY_PARTNERS[slug];

  const { toggleActivityPartner, isActivityPartnerFavorite } = useFavorites();

  if (!category) {
    return (
      <div className="page-bg text-white font-sans min-h-screen">
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
          <GlassCard variant="app" padding="lg">
            <p className="text-sm font-medium text-white">Categoria não encontrada.</p>
            <Link
              href="/activities"
              className="mt-4 inline-flex text-sm font-medium text-white/80 underline-offset-2 hover:underline"
            >
              ← Voltar às atividades
            </Link>
          </GlassCard>
        </div>
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
            title={category.label}
            subtitle="Escolhe um parceiro para ver as atividades disponíveis."
          />
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {category.partners.map((partner) => (
            <GlassCard
              key={partner.id}
              variant="app"
              padding="none"
              hover
              activityStyle
              className="flex flex-col overflow-hidden transition duration-[180ms] hover:translate-y-[-2px]"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={partner.imageSrc}
                  alt={partner.name}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />
                <div className="absolute right-3 top-3">
                  <FavoriteButton
                    isFavorite={isActivityPartnerFavorite(slug, partner.id)}
                    onToggle={() => toggleActivityPartner(slug, partner.id, category.label, partner.name)}
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="app-card-title text-white">
                  {partner.name}
                </h3>
                <p className="mt-1 text-[15px] font-medium text-white/70">
                  {partner.location}
                </p>
                <p className="mt-3 flex-1 text-[13px] text-white/75">
                  {partner.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-white/80">
                  <span>{partner.activitiesCount} atividades</span>
                  <span className="text-white/50">·</span>
                  <span>Desde {partner.minCredits} crédito{partner.minCredits !== 1 ? "s" : ""}</span>
                </div>
                <Link
                  href={`/activities/categorias/${slug}/parceiros/${partner.id}`}
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
          ))}
        </div>
      </div>
    </div>
  );
}

