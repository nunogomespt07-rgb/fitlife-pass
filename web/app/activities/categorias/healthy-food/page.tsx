"use client";

import Image from "next/image";
import Link from "next/link";
import { RESTAURANTS, formatRestaurantDistanceWithCoords } from "@/lib/restaurantsData";
import GlassCard from "../../../components/ui/GlassCard";
import PrimaryButton from "../../../components/ui/PrimaryButton";
import FavoriteButton from "../../../components/ui/FavoriteButton";
import SectionHeader from "../../../components/ui/SectionHeader";
import { useFavorites } from "@/app/context/FavoritesContext";
import { useGeolocation, useProfileCoords, DEFAULT_LAT, DEFAULT_LON } from "@/app/hooks/useGeolocation";

export default function HealthyFoodCategoryPage() {
  const { toggleRestaurant, isRestaurantFavorite } = useFavorites();
  const { position } = useGeolocation();
  const profileCoords = useProfileCoords();
  const userLat = position?.lat ?? profileCoords?.lat ?? DEFAULT_LAT;
  const userLon = position?.lon ?? profileCoords?.lon ?? DEFAULT_LON;

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <Link
          href="/activities"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
        >
          ← Voltar às atividades
        </Link>

        <div className="mt-8">
          <SectionHeader
            title="Healthy Food"
            subtitle="Restaurantes parceiros com reserva de mesa e desconto exclusivo para subscritores FitLife Pass."
          />
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {RESTAURANTS.map((restaurant) => {
            const distance = formatRestaurantDistanceWithCoords(restaurant, userLat, userLon);
            return (
              <GlassCard
                key={restaurant.id}
                variant="dark"
                padding="none"
                hover
                className="flex flex-col overflow-hidden rounded-3xl border-white/12 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={restaurant.imageSrc}
                    alt={restaurant.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent" />
                  <div className="absolute right-3 top-3">
                    <FavoriteButton
                      isFavorite={isRestaurantFavorite(restaurant.id)}
                      onToggle={() => toggleRestaurant(restaurant.id, restaurant.name)}
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold tracking-tight text-white">
                    {restaurant.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-white/70">
                    {restaurant.description}
                  </p>
                  {distance && (
                    <p className="mt-2 text-xs text-white/60">
                      {distance} de distância
                    </p>
                  )}
                  <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/90">
                      Benefício FitLife Pass
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-emerald-100">
                      {restaurant.fitlifeBenefit}
                    </p>
                  </div>
                  <Link
                    href={`/activities/categorias/healthy-food/restaurantes/${restaurant.id}`}
                    className="mt-5 block"
                  >
                    <PrimaryButton variant="secondary" className="w-full justify-center">
                      Reservar mesa →
                    </PrimaryButton>
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
