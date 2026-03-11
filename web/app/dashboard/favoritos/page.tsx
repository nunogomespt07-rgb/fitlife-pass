"use client";

import Link from "next/link";
import { useFavorites } from "@/app/context/FavoritesContext";
import GlassCard from "../../components/ui/GlassCard";

export default function DashboardFavoritosPage() {
  const { favorites } = useFavorites();

  return (
    <div className="page-bg text-white font-sans min-h-screen">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Favoritos
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Ginásios, estúdios e restaurantes que guardaste.
        </p>

        {favorites.length === 0 ? (
          <GlassCard
            variant="dark"
            padding="lg"
            className="mt-8 flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-white/12 bg-white/5 text-center backdrop-blur-xl"
          >
            <p className="font-medium text-white">Ainda não tens favoritos.</p>
            <p className="mt-2 text-sm text-white/70">
              Adiciona parceiros ou restaurantes ao explorar Atividades e Healthy Food.
            </p>
            <Link
              href="/activities"
              className="mt-6 inline-flex rounded-full border border-white/22 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explorar atividades
            </Link>
          </GlassCard>
        ) : (
          <ul className="mt-8 space-y-4">
            {favorites.map((item) => {
              if (item.type === "activity") {
                return (
                  <li key={`activity:${item.categorySlug}:${item.partnerId}`}>
                    <Link
                      href={`/activities/categorias/${item.categorySlug}/parceiros/${item.partnerId}`}
                      className="block"
                    >
                      <GlassCard
                        variant="dark"
                        padding="lg"
                        hover
                        className="rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:shadow-xl"
                      >
                        <p className="font-semibold text-white">{item.partnerName}</p>
                        <p className="mt-1 text-sm text-white/60">{item.categoryLabel}</p>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
                          Ver atividades →
                        </span>
                      </GlassCard>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={`restaurant:${item.restaurantId}`}>
                  <Link
                    href={`/activities/categorias/healthy-food/restaurantes/${item.restaurantId}`}
                    className="block"
                  >
                    <GlassCard
                      variant="dark"
                      padding="lg"
                      hover
                      className="rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:shadow-xl"
                    >
                      <p className="font-semibold text-white">{item.restaurantName}</p>
                      <p className="mt-1 text-sm text-white/60">Healthy Food</p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white/80">
                        Reservar mesa →
                      </span>
                    </GlassCard>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
