"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CreditCard,
  Dumbbell,
  CircleDot,
  Flower2,
  Sparkles,
  Flame,
  Waves,
  UtensilsCrossed,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  ginasios: Dumbbell,
  padel: CircleDot,
  yoga: Flower2,
  estudios: Sparkles,
  crossfit: Flame,
  piscinas: Waves,
  "healthy-food": UtensilsCrossed,
  danca: Sparkles,
  pilates: Sparkles,
  "pilates-reformer": Sparkles,
  "massagem-desportiva": Sparkles,
  nutricao: Sparkles,
  "personal-training": Sparkles,
};

const CATEGORY_ACCENT: Record<string, string> = {
  ginasios: "border-t-blue-400/35",
  padel: "border-t-amber-400/30",
  yoga: "border-t-emerald-400/30",
  estudios: "border-t-violet-400/30",
  crossfit: "border-t-orange-400/30",
  piscinas: "border-t-cyan-400/30",
  "healthy-food": "border-t-rose-400/25",
  danca: "border-t-violet-400/30",
  pilates: "border-t-violet-400/30",
  "pilates-reformer": "border-t-violet-400/30",
  "massagem-desportiva": "border-t-cyan-400/25",
  nutricao: "border-t-emerald-400/25",
  "personal-training": "border-t-blue-400/25",
};

const CTA_LABEL: Record<string, string> = {
  ginasios: "Explorar clubes",
  crossfit: "Explorar boxes",
  piscinas: "Explorar piscinas",
};

const ACTIVITY_CATEGORIES = [
  { slug: "ginasios", label: "Ginásios", description: "Health clubs e ginásios completos.", city: "Lisboa", creditsFrom: 6 },
  { slug: "padel", label: "Padel", description: "Campos de padel em clubes parceiros.", city: "Lisboa", creditsFrom: 8 },
  { slug: "yoga", label: "Yoga", description: "Yoga em estúdios calmos e modernos.", city: "Lisboa", creditsFrom: 4 },
  { slug: "estudios", label: "Estúdios", description: "Pilates, cycling, HIIT e mais.", city: "Lisboa", creditsFrom: 6 },
  { slug: "pilates", label: "Pilates", description: "Pilates mat e postural com foco em postura e core.", city: "Lisboa", creditsFrom: 7 },
  { slug: "pilates-reformer", label: "Pilates Reformer", description: "Reformer premium com vagas limitadas.", city: "Lisboa", creditsFrom: 10 },
  { slug: "danca", label: "Dança", description: "Aulas de dança para energia, cardio e bem-estar.", city: "Lisboa", creditsFrom: 7 },
  { slug: "massagem-desportiva", label: "Massagem desportiva", description: "Recuperação e terapia manual para performance.", city: "Lisboa", creditsFrom: 12 },
  { slug: "nutricao", label: "Nutrição", description: "Consultas e acompanhamento nutricional.", city: "Lisboa", creditsFrom: 8 },
  { slug: "personal-training", label: "Personal training", description: "Sessões premium com treinador dedicado.", city: "Lisboa", creditsFrom: 12 },
  { slug: "crossfit", label: "CrossFit", description: "Boxes para treinos intensos.", city: "Lisboa", creditsFrom: 8 },
  { slug: "piscinas", label: "Piscinas", description: "Natação e treinos aquáticos.", city: "Lisboa", creditsFrom: 5 },
  { slug: "healthy-food", label: "Healthy Food", description: "Restaurantes com desconto FitLife Pass.", city: "Lisboa", creditsFrom: 6 },
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
            {ACTIVITY_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Sparkles;
              const ctaLabel = CTA_LABEL[cat.slug] ?? "Explorar parceiros";
              return (
                <Link
                  key={cat.slug}
                  href={`/activities/categorias/${cat.slug}`}
                  className="group block h-full"
                  aria-label={`${ctaLabel} ${cat.label}`}
                >
                  <article
                    className={`relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/[0.12] border-t-2 bg-gradient-to-b from-[#0f1b3c] via-[#0b1638] to-[#080f2c] p-7 text-center shadow-[0_18px_44px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.05)_inset] transition-all duration-[140ms] ease-out hover:-translate-y-1 hover:border-white/[0.2] hover:shadow-[0_28px_56px_rgba(0,0,0,0.42),0_0_0_1px_rgba(255,255,255,0.08)_inset] active:translate-y-0 ${CATEGORY_ACCENT[cat.slug] ?? "border-t-blue-400/30"}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.07] via-transparent to-transparent pointer-events-none" aria-hidden />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)] pointer-events-none" aria-hidden />
                    <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" aria-hidden />

                    <div className="relative flex flex-1 flex-col items-center justify-between">
                      <div className="w-full">
                        <div className="mb-6 flex justify-center">
                          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-white/95 ring-1 ring-white/12 transition duration-[140ms] group-hover:bg-white/[0.1] group-hover:ring-white/20 group-hover:shadow-[0_0_28px_rgba(255,255,255,0.12)]">
                            <span className="absolute inset-0 rounded-full bg-white/[0.08] blur-xl transition duration-[140ms] group-hover:bg-white/[0.12]" aria-hidden />
                            <Icon className="relative h-7 w-7" strokeWidth={1.6} aria-hidden />
                          </span>
                        </div>
                        <h2 className="mb-4 text-[22px] font-extrabold leading-tight tracking-tight text-white sm:text-[24px]">
                          {cat.label}
                        </h2>
                        <p className="mx-auto mb-5 max-w-[260px] text-[15px] leading-relaxed text-white/80">
                          {cat.description}
                        </p>
                        <p className="mb-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[13px] text-white/70">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-white/50" aria-hidden />
                            {cat.city}
                          </span>
                          <span className="text-white/40" aria-hidden>•</span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-white/50" aria-hidden />
                            Sessões disponíveis
                          </span>
                          <span className="text-white/40" aria-hidden>•</span>
                          <span className="inline-flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 shrink-0 text-white/50" aria-hidden />
                            A partir de {cat.creditsFrom} créditos
                          </span>
                        </p>
                      </div>
                      <span className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-white/12 px-6 py-4 text-[15px] font-semibold text-white ring-1 ring-white/20 transition duration-[140ms] group-hover:bg-white/18 group-hover:ring-white/30 group-hover:brightness-110">
                        {ctaLabel}
                        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
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
