"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, CreditCard } from "lucide-react";
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
  { slug: "ginasios", label: "Ginásios", description: "Treina em health clubs e ginásios completos.", city: "Lisboa", creditsFrom: 6 },
  { slug: "padel", label: "Padel", description: "Reserva campos de padel em clubes parceiros.", city: "Lisboa", creditsFrom: 8 },
  { slug: "yoga", label: "Yoga", description: "Aulas de yoga em estúdios calmos e modernos.", city: "Lisboa", creditsFrom: 4 },
  { slug: "estudios", label: "Estúdios", description: "Pilates, cycling, HIIT e muito mais.", city: "Lisboa", creditsFrom: 6 },
  { slug: "crossfit", label: "CrossFit", description: "Boxes especializadas para treinos intensos.", city: "Lisboa", creditsFrom: 8 },
  { slug: "piscinas", label: "Piscinas", description: "Natação e treinos aquáticos em piscinas parceiras.", city: "Lisboa", creditsFrom: 5 },
  { slug: "healthy-food", label: "Healthy Food", description: "Restaurantes saudáveis com reserva e desconto exclusivo FitLife Pass.", city: "Lisboa", creditsFrom: 6 },
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
        variant="app"
        padding="md"
        hover
        className="flex h-full flex-col transition duration-[180ms] hover:translate-y-[-2px]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="app-card-title text-white">{p.name}</p>
            <p className="mt-1 text-[15px] text-white/65">
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
    <div className="text-white font-sans min-h-screen">
      {/* Hero: premium fitness-hero background */}
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
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#070f2b]/70 via-[#0a1435]/40 to-transparent"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#070f2b]/80 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(58,108,255,0.2),transparent_60%)] blur-[120px]"
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pb-28 pt-12">
        <GlassCard variant="app" padding="lg" className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
            FitLife Pass
          </p>
          <h1 className="app-hero-title mt-4 text-white sm:mt-5">
            Atividades
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-base">
            Escolhe uma categoria para ver parceiros e reservar atividades.
          </p>
        </GlassCard>

        <div className="relative mb-10">
          <GlassCard variant="app" padding="md">
            <p className="text-[15px] text-white/80 sm:text-base">
              Explora parceiros por categoria e encontra a atividade ideal para ti — ginásios,
              padel, yoga, estúdios, crossfit, piscinas e healthy food com benefício FitLife Pass.
            </p>
          </GlassCard>
        </div>

        {/* Categorias principais */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="app-section-title text-white/90">
              Explorar por categoria
            </h2>
            <p className="mt-2 text-[15px] text-white/65">
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
                  variant="app"
                  padding="lg"
                  hover
                  activityStyle
                  className="flex h-full min-h-[200px] flex-col items-center justify-between text-center transition-[150ms] ease-out border-white/[0.1] shadow-[0_12px_32px_rgba(0,0,0,0.28)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.32)]"
                >
                  <div className="w-full">
                    <h2 className="mb-2 text-[18px] font-semibold text-white sm:text-[20px]">
                      {cat.label}
                    </h2>
                    <p className="mb-3 text-[15px] text-white/75 sm:mb-[14px]">
                      {cat.description}
                    </p>
                    <p className="mb-[18px] flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-white/70">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-white/55" aria-hidden />
                        {cat.city}
                      </span>
                      <span className="text-white/40" aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-white/55" aria-hidden />
                        Sessões disponíveis
                      </span>
                      <span className="text-white/40" aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 shrink-0 text-white/55" aria-hidden />
                        desde {cat.creditsFrom} créditos
                      </span>
                    </p>
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition duration-[150ms] ease-out group-hover:bg-white/15 group-hover:border-white/25 group-hover:translate-y-[-2px]">
                    Explorar parceiros →
                  </span>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Perto de ti */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="app-section-title text-white/90">
              Perto de ti
            </h2>
            <p className="mt-2 text-[15px] text-white/65">
              {geoLoading
                ? "A obter a tua localização…"
                : "Parceiros mais próximos. Até 4 sugestões dentro de 10 km."}
            </p>
          </div>
          {nearbyPartners.length === 0 ? (
            <GlassCard variant="app" padding="lg">
              <p className="text-[15px] text-white/70">Nenhum parceiro próximo nos 10 km.</p>
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
