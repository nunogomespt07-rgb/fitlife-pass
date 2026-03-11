"use client";

import Image from "next/image";
import Link from "next/link";
import GlassCard from "../components/ui/GlassCard";
import FavoriteButton from "../components/ui/FavoriteButton";
import {
  formatDistance,
  getPartnersNearby,
  distanceKm,
  type PartnerWithCategory,
} from "@/lib/activitiesData";
import { useGeolocation, DEFAULT_LAT, DEFAULT_LON } from "@/app/hooks/useGeolocation";
import { useProfileCoords } from "@/app/hooks/useGeolocation";
import { useFavorites } from "@/app/context/FavoritesContext";

const ACTIVITIES_HERO_SRC = "/images/fitness-hero.jpg";

const ACTIVITY_CATEGORIES = [
  {
    slug: "ginasios",
    label: "Ginásios",
    description: "Treina em health clubs e ginásios completos.",
  },
  {
    slug: "padel",
    label: "Padel",
    description: "Reserva campos de padel em clubes parceiros.",
  },
  {
    slug: "yoga",
    label: "Yoga",
    description: "Aulas de yoga em estúdios calmos e modernos.",
  },
  {
    slug: "estudios",
    label: "Estúdios",
    description: "Pilates, cycling, HIIT e muito mais.",
  },
  {
    slug: "crossfit",
    label: "CrossFit",
    description: "Boxes especializadas para treinos intensos.",
  },
  {
    slug: "piscinas",
    label: "Piscinas",
    description: "Natação e treinos aquáticos em piscinas parceiras.",
  },
  {
    slug: "healthy-food",
    label: "Healthy Food",
    description: "Restaurantes saudáveis com reserva e desconto exclusivo FitLife Pass.",
  },
] as const;

function NearbyPartnerCard({
  p,
  km,
  onFavoriteToggle,
  isFavorite,
}: {
  p: PartnerWithCategory;
  km: number;
  onFavoriteToggle: () => void;
  isFavorite: boolean;
}) {
  return (
    <Link
      href={`/activities/categorias/${p.categorySlug}/parceiros/${p.id}`}
      className="group block h-full"
    >
      <GlassCard
        variant="dark"
        padding="md"
        hover
        className="flex h-full flex-col rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/20 hover:shadow-xl"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{p.name}</p>
            <p className="mt-1 text-sm text-white/60">
              {formatDistance(km)} de distância
            </p>
          </div>
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={onFavoriteToggle}
            ariaLabel={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          />
        </div>
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/80 transition group-hover:text-white">
          Ver atividades →
        </span>
      </GlassCard>
    </Link>
  );
}

export default function ActivitiesPage() {
  const { position, loading: geoLoading } = useGeolocation();
  const profileCoords = useProfileCoords();
  const userLat = position?.lat ?? profileCoords?.lat ?? DEFAULT_LAT;
  const userLon = position?.lon ?? profileCoords?.lon ?? DEFAULT_LON;

  const { toggleActivityPartner, isActivityPartnerFavorite } = useFavorites();
  const nearbyPartners = getPartnersNearby(userLat, userLon, {
    maxDistanceKm: 10,
    maxResults: 4,
  });
  return (
    <div className="page-bg text-white font-sans min-h-screen">
      {/* Hero: premium fitness-hero background – integrated with blue UI */}
      <div className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="relative h-[320px] sm:h-[340px] md:h-[360px] w-full overflow-hidden rounded-3xl shadow-xl">
            <Image
              src={ACTIVITIES_HERO_SRC}
              alt="Premium gym training"
              fill
              className="object-cover object-center brightness-105 contrast-105"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            {/* Main cinematic gradient – Apple Fitness+ / Nike feel */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#07122b]/70 via-[#0b1f52]/40 to-transparent"
              aria-hidden
            />
            {/* Bottom fade – blends hero into section background */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#07122b]/80 to-transparent"
              aria-hidden
            />
            {/* Subtle radial blue glow behind athlete – depth & integration */}
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.25),transparent_60%)] blur-[120px]"
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-28 pt-12">
        {/* FitLife Pass / Atividades – editorial header, lighter glass */}
        <GlassCard variant="dark" padding="lg" className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
            FitLife Pass
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Atividades
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            Escolhe uma categoria para ver parceiros e reservar atividades.
          </p>
        </GlassCard>

        {/* Supporting copy instead of duplicate search */}
        <div className="relative mb-10">
          <GlassCard
            variant="dark"
            padding="md"
            className="rounded-2xl border border-white/[0.06] bg-white/[0.04] backdrop-blur-xl"
          >
            <p className="text-sm text-white/80 sm:text-base">
              Explora parceiros por categoria e encontra a atividade ideal para ti — ginásios,
              padel, yoga, estúdios, crossfit, piscinas e healthy food com benefício FitLife Pass.
            </p>
          </GlassCard>
        </div>

        {/* Categorias principais – entrada para o sistema de atividades */}
        <section className="mb-12">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
              Explorar por categoria
            </p>
            <p className="mt-2 text-sm text-white/75">
              Escolhe o tipo de atividade para ver os parceiros disponíveis.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIVITY_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/activities/categorias/${cat.slug}`}
                className="group block h-full"
              >
                <GlassCard
                  variant="dark"
                  padding="lg"
                  hover
                  className="flex h-full min-h-[180px] flex-col items-center justify-between rounded-3xl border border-white/12 bg-white/5 text-center backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/20 hover:shadow-xl"
                >
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {cat.label}
                    </h2>
                    <p className="mt-3 text-xs text-white/65">
                      {cat.description}
                    </p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition duration-200 group-hover:bg-white/15 group-hover:border-white/30 group-hover:shadow-lg">
                    Ver parceiros →
                  </span>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Perto de ti – máximo 4 parceiros dentro de 10 km, quick discovery */}
        <section className="mb-12">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
              Perto de ti
            </p>
            <p className="mt-2 text-sm text-white/75">
              {geoLoading
                ? "A obter a tua localização…"
                : "Parceiros mais próximos. Até 4 sugestões dentro de 10 km."}
            </p>
          </div>
          {nearbyPartners.length === 0 ? (
            <GlassCard variant="dark" padding="lg" className="rounded-2xl border-white/12 bg-white/5">
              <p className="text-sm text-white/70">Nenhum parceiro próximo nos 10 km.</p>
            </GlassCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {nearbyPartners.map((p) => (
                <NearbyPartnerCard
                  key={p.id}
                  p={p}
                  km={
                    p.latitude != null && p.longitude != null
                      ? distanceKm(userLat, userLon, p.latitude, p.longitude)
                      : 0
                  }
                  onFavoriteToggle={() =>
                    toggleActivityPartner(p.categorySlug, p.id, p.categoryLabel, p.name)
                  }
                  isFavorite={isActivityPartnerFavorite(p.categorySlug, p.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
