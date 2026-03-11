"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FavoriteItem } from "@/lib/favorites";
import {
  getStoredFavorites,
  setStoredFavorites,
  isActivityPartnerFavorited,
  isRestaurantFavorited,
} from "@/lib/favorites";

type FavoritesContextValue = {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (item: FavoriteItem) => void;
  toggleActivityPartner: (
    categorySlug: string,
    partnerId: string,
    categoryLabel: string,
    partnerName: string
  ) => void;
  toggleRestaurant: (restaurantId: string, restaurantName: string) => void;
  isActivityPartnerFavorite: (categorySlug: string, partnerId: string) => boolean;
  isRestaurantFavorite: (restaurantId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(getStoredFavorites());
  }, []);

  const addFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      const key = item.type === "activity" ? `activity:${item.categorySlug}:${item.partnerId}` : `restaurant:${item.restaurantId}`;
      if (prev.some((f) => (f.type === "activity" ? `activity:${f.categorySlug}:${f.partnerId}` : `restaurant:${f.restaurantId}`) === key))
        return prev;
      const next = [...prev, item];
      setStoredFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      const next =
        item.type === "activity"
          ? prev.filter(
              (f) =>
                !(f.type === "activity" && f.categorySlug === item.categorySlug && f.partnerId === item.partnerId)
            )
          : prev.filter(
              (f) => !(f.type === "restaurant" && f.restaurantId === item.restaurantId)
            );
      setStoredFavorites(next);
      return next;
    });
  }, []);

  const toggleActivityPartner = useCallback(
    (categorySlug: string, partnerId: string, categoryLabel: string, partnerName: string) => {
      setFavorites((prev) => {
        const isFav = isActivityPartnerFavorited(prev, categorySlug, partnerId);
        const next = isFav
          ? prev.filter(
              (f) =>
                !(f.type === "activity" && f.categorySlug === categorySlug && f.partnerId === partnerId)
            )
          : [...prev, { type: "activity", partnerId, categorySlug, categoryLabel, partnerName }];
        setStoredFavorites(next);
        return next;
      });
    },
    []
  );

  const toggleRestaurant = useCallback((restaurantId: string, restaurantName: string) => {
    setFavorites((prev) => {
      const isFav = isRestaurantFavorited(prev, restaurantId);
      const next = isFav
        ? prev.filter(
            (f) => !(f.type === "restaurant" && f.restaurantId === restaurantId)
          )
        : [...prev, { type: "restaurant", restaurantId, restaurantName }];
      setStoredFavorites(next);
      return next;
    });
  }, []);

  const isActivityPartnerFavorite = useCallback(
    (categorySlug: string, partnerId: string) =>
      isActivityPartnerFavorited(favorites, categorySlug, partnerId),
    [favorites]
  );

  const isRestaurantFavorite = useCallback(
    (restaurantId: string) => isRestaurantFavorited(favorites, restaurantId),
    [favorites]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      addFavorite,
      removeFavorite,
      toggleActivityPartner,
      toggleRestaurant,
      isActivityPartnerFavorite,
      isRestaurantFavorite,
    }),
    [
      favorites,
      addFavorite,
      removeFavorite,
      toggleActivityPartner,
      toggleRestaurant,
      isActivityPartnerFavorite,
      isRestaurantFavorite,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
