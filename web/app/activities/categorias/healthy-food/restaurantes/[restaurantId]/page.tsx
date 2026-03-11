"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getRestaurantById } from "@/lib/restaurantsData";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import FavoriteButton from "@/app/components/ui/FavoriteButton";
import { useFavorites } from "@/app/context/FavoritesContext";

export default function RestaurantDetailPage() {
  const params = useParams() as { restaurantId?: string | string[] };
  const rawId = params.restaurantId;
  const restaurantId = Array.isArray(rawId) ? rawId[0] : rawId ?? "";
  const restaurant = getRestaurantById(restaurantId);
  const { toggleRestaurant, isRestaurantFavorite } = useFavorites();

  if (!restaurant) {
    return (
      <div className="page-bg text-white font-sans min-h-screen">
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
          <GlassCard variant="dark" padding="lg">
            <p className="text-sm font-medium text-white">Restaurante não encontrado.</p>
            <Link
              href="/activities/categorias/healthy-food"
              className="mt-4 inline-flex text-sm font-medium text-white/80 underline-offset-2 hover:underline"
            >
              ← Voltar a Healthy Food
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen font-sans text-white">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <nav className="flex items-center gap-2 text-sm text-white/80">
          <Link href="/activities" className="font-medium transition hover:text-white">
            Atividades
          </Link>
          <span aria-hidden>/</span>
          <Link
            href="/activities/categorias/healthy-food"
            className="font-medium transition hover:text-white"
          >
            Healthy Food
          </Link>
          <span aria-hidden>/</span>
          <span className="text-white">{restaurant.name}</span>
        </nav>

        <div className="mt-8">
          <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-64">
            <Image
              src={restaurant.imageSrc}
              alt={restaurant.name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07122b]/90 via-[#07122b]/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {restaurant.name}
                </h1>
                <p className="mt-1 text-sm text-white/90">{restaurant.cuisine}</p>
              </div>
              <FavoriteButton
                isFavorite={isRestaurantFavorite(restaurant.id)}
                onToggle={() => toggleRestaurant(restaurant.id, restaurant.name)}
              />
            </div>
          </div>

          <p className="mt-4 text-sm text-white/80">{restaurant.description}</p>
          <p className="mt-2 text-sm font-medium text-white/90">{restaurant.location}</p>
          {restaurant.rating != null && (
            <p className="mt-1 text-sm text-white/70">
              Avaliação: {restaurant.rating}/5
            </p>
          )}
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Benefícios FitLife Pass
          </h2>
          <GlassCard
            variant="dark"
            padding="lg"
            className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 backdrop-blur-xl"
          >
            <ul className="space-y-2 text-sm text-white/95">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-emerald-400">✓</span>
                <span>{restaurant.fitlifeBenefit} para subscritores</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-white/70">
              Apresenta o teu nome na chegada ao restaurante para usufruir do benefício.
            </p>
          </GlassCard>
        </section>

        {(restaurant.address ?? restaurant.city ?? (restaurant.latitude != null && restaurant.longitude != null)) && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Localização
            </h2>
            <GlassCard
              variant="dark"
              padding="none"
              className="overflow-hidden rounded-2xl border border-white/12 bg-white/5 shadow-lg shadow-black/10 backdrop-blur-xl"
            >
              <div className="p-6">
                {restaurant.address && (
                  <p className="font-medium text-white">{restaurant.address}</p>
                )}
                {restaurant.city && (
                  <p className="mt-1 text-sm text-white/75">
                    {restaurant.postalCode ? `${restaurant.postalCode} ` : ""}
                    {restaurant.city}
                  </p>
                )}
                {restaurant.latitude != null && restaurant.longitude != null && (
                  <div className="mt-5 h-56 w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    <iframe
                      title={`Mapa: ${restaurant.name}`}
                      src={`https://www.google.com/maps?q=${restaurant.latitude},${restaurant.longitude}&z=15&output=embed`}
                      className="h-full w-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
                {(restaurant.latitude != null && restaurant.longitude != null) && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 hover:border-white/30 active:scale-[0.98]"
                  >
                    Abrir no Google Maps
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </GlassCard>
          </section>
        )}

        <div className="mt-10">
          <Link
            href={`/activities/categorias/healthy-food/restaurantes/${restaurant.id}/reservar`}
            className="block"
          >
            <PrimaryButton variant="primary" className="w-full sm:w-auto">
              Reservar mesa
            </PrimaryButton>
          </Link>
        </div>

        <div className="mt-10">
          <Link
            href="/activities/categorias/healthy-food"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
          >
            ← Voltar aos restaurantes
          </Link>
        </div>
      </div>
    </div>
  );
}
