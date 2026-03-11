import { distanceKm, formatDistance, DEMO_USER_LAT, DEMO_USER_LON } from "@/lib/activitiesData";

export type Restaurant = {
  id: string;
  name: string;
  imageSrc: string;
  description: string;
  cuisine: string;
  location: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  /** FitLife Pass benefit, e.g. "10% desconto exclusivo" */
  fitlifeBenefit: string;
};

export const FITLIFE_DISCOUNT_LABEL = "10% desconto exclusivo";

export const RESTAURANTS: Restaurant[] = [
  {
    id: "green-bowl-lisboa",
    name: "Green Bowl Lisboa",
    imageSrc: "/images/food1-hero.jpg",
    description: "Healthy bowls & smoothies com ingredientes frescos e opções veganas.",
    cuisine: "Healthy bowls, smoothies, vegan",
    location: "Lisboa · Saldanha",
    address: "Rua da Artilharia Um 42",
    city: "Lisboa",
    postalCode: "1250-001",
    latitude: 38.7359,
    longitude: -9.1426,
    rating: 4.8,
    fitlifeBenefit: FITLIFE_DISCOUNT_LABEL,
  },
  {
    id: "terra-vegan",
    name: "Terra Vegan",
    imageSrc: "/images/food2-hero.jpg",
    description: "Cozinha vegetariana e vegan 100% biológica com reserva de mesa.",
    cuisine: "Vegetariano, vegan, bio",
    location: "Lisboa · Príncipe Real",
    address: "Rua do Príncipe Real 28",
    city: "Lisboa",
    postalCode: "1200-184",
    latitude: 38.7189,
    longitude: -9.1482,
    rating: 4.6,
    fitlifeBenefit: FITLIFE_DISCOUNT_LABEL,
  },
  {
    id: "fresh-fit-porto",
    name: "Fresh & Fit Porto",
    imageSrc: "/images/food4-hero.jpg",
    description: "Saladas, wraps e pratos proteicos para quem treina.",
    cuisine: "Healthy, proteico, saladas",
    location: "Porto · Boavista",
    address: "Rua da Boavista 88",
    city: "Porto",
    postalCode: "4050-102",
    latitude: 41.1642,
    longitude: -8.6882,
    rating: 4.7,
    fitlifeBenefit: FITLIFE_DISCOUNT_LABEL,
  },
  {
    id: "juice-bar-lisboa",
    name: "Juice Bar Lisboa",
    imageSrc: "/images/food3-hero.jpg",
    description: "Sumos frescos, detox e snacks saudáveis no centro.",
    cuisine: "Sumos, detox, snacks",
    location: "Lisboa · Chiado",
    address: "Rua Garrett 56",
    city: "Lisboa",
    postalCode: "1200-201",
    latitude: 38.7104,
    longitude: -9.1402,
    rating: 4.5,
    fitlifeBenefit: FITLIFE_DISCOUNT_LABEL,
  },
];

export function getRestaurantById(id: string): Restaurant | null {
  return RESTAURANTS.find((r) => r.id === id) ?? null;
}

export function getRestaurantDistanceKm(restaurant: Restaurant): number | null {
  if (restaurant.latitude == null || restaurant.longitude == null) return null;
  return distanceKm(DEMO_USER_LAT, DEMO_USER_LON, restaurant.latitude, restaurant.longitude);
}

export function getRestaurantDistanceKmWithCoords(
  restaurant: Restaurant,
  userLat: number,
  userLon: number
): number | null {
  if (restaurant.latitude == null || restaurant.longitude == null) return null;
  return distanceKm(userLat, userLon, restaurant.latitude, restaurant.longitude);
}

export function formatRestaurantDistance(restaurant: Restaurant): string | null {
  const km = getRestaurantDistanceKm(restaurant);
  return km != null ? formatDistance(km) : null;
}

export function formatRestaurantDistanceWithCoords(
  restaurant: Restaurant,
  userLat: number,
  userLon: number
): string | null {
  const km = getRestaurantDistanceKmWithCoords(restaurant, userLat, userLon);
  return km != null ? formatDistance(km) : null;
}
