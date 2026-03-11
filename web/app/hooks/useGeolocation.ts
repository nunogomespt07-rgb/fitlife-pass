"use client";

import { useCallback, useEffect, useState } from "react";
import { getProfileCoords } from "@/lib/profileCoords";

export type GeoPosition = {
  lat: number;
  lon: number;
} | null;

export type UseGeolocationResult = {
  position: GeoPosition;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export const DEFAULT_LAT = 38.7223;
export const DEFAULT_LON = -9.1393;

/**
 * Returns user's current position from browser geolocation.
 * On deny/unavailable, returns null (caller should use profile/demo fallback).
 */
export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<GeoPosition>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = useCallback(() => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      setLoading(false);
      setError("Geolocalização não disponível");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({ lat: p.coords.latitude, lon: p.coords.longitude });
        setLoading(false);
      },
      () => {
        setPosition(null);
        setLoading(false);
        setError("Localização indisponível");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  return { position, loading, error, refetch: fetchPosition };
}

/** Profile-based coords for fallback when GPS is unavailable. */
export function useProfileCoords(): { lat: number; lon: number } | null {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  useEffect(() => {
    setCoords(getProfileCoords());
  }, []);
  return coords;
}
