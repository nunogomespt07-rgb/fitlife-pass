export type PartnerType = "gym_access" | "class_booking" | "court_booking" | "pool_access";

export type Partner = {
  id: string;
  name: string;
  imageSrc: string;
  location: string;
  description: string;
  activitiesCount: number;
  minCredits: number;
  /** Determines UI: gym_access = QR entry; class_booking / court_booking / pool_access = reservations */
  partnerType: PartnerType;
  /** Full street address */
  address?: string;
  /** City name */
  city?: string;
  latitude?: number;
  longitude?: number;
  /** URL to open in Google Maps (search by coords or address) */
  googleMapsUrl?: string;
  /** For gym_access: opening hours display e.g. "06:00 – 23:00" */
  openingHours?: string;
  /** For gym_access: optional FitLife Pass allowed hours (off-peak) e.g. "06:00 – 11:00, 14:00 – 17:00" */
  fitlifePassHours?: string;
  /** For gym_access: credits per entry (default 1) */
  creditsPerEntry?: number;
};

export const CATEGORY_PARTNERS: Record<
  string,
  { label: string; partners: Partner[] }
> = {
  ginasios: {
    label: "Ginásios",
    partners: [
      {
        id: "fitclub-lisboa",
        name: "FitClub Lisboa",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Saldanha",
        description:
          "Health club premium com musculação, cardio e aulas de grupo.",
        activitiesCount: 12,
        minCredits: 6,
        partnerType: "gym_access",
        openingHours: "06:00 – 23:00",
        creditsPerEntry: 6,
        address: "Av. da República 50",
        city: "Lisboa",
        latitude: 38.7359,
        longitude: -9.1426,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7359,-9.1426",
      },
      {
        id: "bluegym-porto",
        name: "BlueGym Porto",
        imageSrc: "/images/gym-hero.jpg",
        location: "Porto · Boavista",
        description: "Ginásio moderno com foco em treinos funcionais e PT.",
        activitiesCount: 8,
        minCredits: 6,
        partnerType: "gym_access",
        openingHours: "06:00 – 22:00",
        fitlifePassHours: "06:00 – 11:00, 14:00 – 17:00",
        creditsPerEntry: 6,
        address: "Rua da Boavista 120",
        city: "Porto",
        latitude: 41.1642,
        longitude: -8.6882,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1642,-8.6882",
      },
      {
        id: "pulse-fitness-studio",
        name: "Pulse Fitness Studio",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Campo de Ourique",
        description: "Estúdio de fitness com equipamento de última geração e aulas em grupo.",
        activitiesCount: 10,
        minCredits: 6,
        partnerType: "gym_access",
        openingHours: "07:00 – 23:00",
        creditsPerEntry: 6,
        address: "Rua Ferreira Borges 45",
        city: "Lisboa",
        latitude: 38.7192,
        longitude: -9.1682,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7192,-9.1682",
      },
      {
        id: "urban-motion-club",
        name: "Urban Motion Club",
        imageSrc: "/images/gym-hero.jpg",
        location: "Porto · Cedofeita",
        description: "Clube urbano com ambiente premium e programação variada.",
        activitiesCount: 9,
        minCredits: 6,
        partnerType: "gym_access",
        openingHours: "06:00 – 00:00",
        creditsPerEntry: 6,
        address: "Rua de Cedofeita 120",
        city: "Porto",
        latitude: 41.1562,
        longitude: -8.6284,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1562,-8.6284",
      },
    ],
  },
  padel: {
    label: "Padel",
    partners: [
      {
        id: "clube-padel-lisboa",
        name: "Clube Padel Lisboa",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Parque das Nações",
        description: "Campos indoor e outdoor com balneários e bar.",
        activitiesCount: 6,
        minCredits: 10,
        partnerType: "court_booking",
        address: "Alameda dos Oceanos 123",
        city: "Lisboa",
        latitude: 38.7696,
        longitude: -9.0936,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7696,-9.0936",
      },
      {
        id: "padel-line-porto",
        name: "Padel Line Porto",
        imageSrc: "/images/gym-hero.jpg",
        location: "Porto · Matosinhos",
        description: "Centro dedicado ao padel com aulas e reservas por hora.",
        activitiesCount: 5,
        minCredits: 10,
        partnerType: "court_booking",
        address: "Av. da Liberdade 45, Matosinhos",
        city: "Matosinhos",
        latitude: 41.1822,
        longitude: -8.6894,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1822,-8.6894",
      },
      {
        id: "smash-court-club",
        name: "Smash Court Club",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Belém",
        description: "Club de padel com vistas e aulas para todos os níveis.",
        activitiesCount: 6,
        minCredits: 10,
        partnerType: "court_booking",
        address: "Rua da Junqueira 88",
        city: "Lisboa",
        latitude: 38.6982,
        longitude: -9.2086,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.6982,-9.2086",
      },
      {
        id: "arena-padel-studio",
        name: "Arena Padel Studio",
        imageSrc: "/images/gym-hero.jpg",
        location: "Porto · Campanhã",
        description: "Pistas climatizadas e programa de torneios.",
        activitiesCount: 5,
        minCredits: 10,
        partnerType: "court_booking",
        address: "Rua de Campanhã 200",
        city: "Porto",
        latitude: 41.1624,
        longitude: -8.5822,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1624,-8.5822",
      },
    ],
  },
  yoga: {
    label: "Yoga",
    partners: [
      {
        id: "zen-yoga-lisboa",
        name: "Zen Yoga Studio",
        imageSrc: "/images/frontpage-hero.jpg",
        location: "Lisboa · Príncipe Real",
        description: "Estúdio de yoga luminoso com aulas de vinyasa e yin.",
        activitiesCount: 14,
        minCredits: 8,
        partnerType: "class_booking",
        address: "Rua do Príncipe Real 28",
        city: "Lisboa",
        latitude: 38.7189,
        longitude: -9.1482,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7189,-9.1482",
      },
      {
        id: "flow-yoga-porto",
        name: "Flow Yoga Porto",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Porto · Foz",
        description: "Yoga com vista mar, ideal para relaxar após o trabalho.",
        activitiesCount: 10,
        minCredits: 8,
        partnerType: "class_booking",
        address: "Av. do Brasil 120, Foz do Douro",
        city: "Porto",
        latitude: 41.1512,
        longitude: -8.6756,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1512,-8.6756",
      },
      {
        id: "alma-studio-lisboa",
        name: "Alma Studio Lisboa",
        imageSrc: "/images/frontpage-hero.jpg",
        location: "Lisboa · Lapa",
        description: "Yoga e mindfulness num espaço acolhedor no coração de Lisboa.",
        activitiesCount: 12,
        minCredits: 8,
        partnerType: "class_booking",
        address: "Rua do Patrocínio 56",
        city: "Lisboa",
        latitude: 38.7082,
        longitude: -9.1624,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7082,-9.1624",
      },
      {
        id: "core-pilates",
        name: "Core Pilates Studio",
        imageSrc: "/images/frontpage-hero.jpg",
        location: "Porto · Cedofeita",
        description: "Pilates em máquinas com foco em postura e força.",
        activitiesCount: 9,
        minCredits: 8,
        partnerType: "class_booking",
        address: "Rua de Cedofeita 88",
        city: "Porto",
        latitude: 41.1556,
        longitude: -8.6254,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1556,-8.6254",
      },
    ],
  },
  estudios: {
    label: "Estúdios",
    partners: [
      {
        id: "pulse-cycling",
        name: "Pulse Cycling Studio",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Campo Pequeno",
        description: "Aulas de cycling com música e iluminação imersiva.",
        activitiesCount: 7,
        minCredits: 8,
        partnerType: "class_booking",
        address: "Praça do Campo Pequeno 1",
        city: "Lisboa",
        latitude: 38.7376,
        longitude: -9.1442,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7376,-9.1442",
      },
      {
        id: "reformer-pilates-club",
        name: "Reformer Pilates Club",
        imageSrc: "/images/frontpage-hero.jpg",
        location: "Lisboa · Chiado",
        description: "Pilates em reformer com sessões individuais e em grupo.",
        activitiesCount: 8,
        minCredits: 8,
        partnerType: "class_booking",
        address: "Rua Garrett 42",
        city: "Lisboa",
        latitude: 38.7104,
        longitude: -9.1402,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7104,-9.1402",
      },
      {
        id: "mind-body-studio",
        name: "Mind & Body Studio",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Porto · Foz",
        description: "HIIT, funcional e recuperação num único espaço.",
        activitiesCount: 8,
        minCredits: 8,
        partnerType: "class_booking",
        address: "Rua do Passeio Alegre 100",
        city: "Porto",
        latitude: 41.1482,
        longitude: -8.6824,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1482,-8.6824",
      },
      {
        id: "urban-flow-studio",
        name: "Urban Flow Studio",
        imageSrc: "/images/gym-hero.jpg",
        location: "Lisboa · Arroios",
        description: "Barre, TRX e aulas de movimento consciente.",
        activitiesCount: 7,
        minCredits: 8,
        partnerType: "class_booking",
        address: "Av. Almirante Reis 120",
        city: "Lisboa",
        latitude: 38.7282,
        longitude: -9.1342,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7282,-9.1342",
      },
    ],
  },
  crossfit: {
    label: "CrossFit",
    partners: [
      {
        id: "porto-crossfit-box",
        name: "Porto CrossFit Box",
        imageSrc: "/images/gym-hero.jpg",
        location: "Porto · Bonfim",
        description: "Ambiente competitivo com programação diária de WOD.",
        activitiesCount: 6,
        minCredits: 10,
        partnerType: "class_booking",
        address: "Rua do Bonfim 200",
        city: "Porto",
        latitude: 41.1522,
        longitude: -8.5984,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1522,-8.5984",
      },
      {
        id: "forge-training-club",
        name: "Forge Training Club",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Alcântara",
        description: "CrossFit e peso livre com coaches certificados.",
        activitiesCount: 5,
        minCredits: 10,
        partnerType: "class_booking",
        address: "Rua da Cozinha Económica 12",
        city: "Lisboa",
        latitude: 38.7024,
        longitude: -9.1782,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7024,-9.1782",
      },
      {
        id: "alpha-box-lisboa",
        name: "Alpha Box Lisboa",
        imageSrc: "/images/gym-hero.jpg",
        location: "Lisboa · Alfama",
        description: "Box CrossFit com treinos em pequenos grupos.",
        activitiesCount: 4,
        minCredits: 10,
        partnerType: "class_booking",
        address: "Rua de São Pedro 15",
        city: "Lisboa",
        latitude: 38.7108,
        longitude: -9.1304,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7108,-9.1304",
      },
      {
        id: "motion-lab-crossfit",
        name: "Motion Lab CrossFit",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Porto · Ramalde",
        description: "Metcon, levantamento olímpico e mobilidade.",
        activitiesCount: 6,
        minCredits: 10,
        partnerType: "class_booking",
        address: "Rua de Ramalde 400",
        city: "Porto",
        latitude: 41.1722,
        longitude: -8.6424,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1722,-8.6424",
      },
    ],
  },
  piscinas: {
    label: "Piscinas",
    partners: [
      {
        id: "aqua-lisboa",
        name: "Aqua Lisboa Club",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Telheiras",
        description:
          "Piscina coberta para treinos livres e aulas de natação.",
        activitiesCount: 5,
        minCredits: 8,
        partnerType: "pool_access",
        address: "Av. das Nações Unidas 2",
        city: "Lisboa",
        latitude: 38.7592,
        longitude: -9.1642,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7592,-9.1642",
      },
      {
        id: "wave-porto",
        name: "Wave Swim Porto",
        imageSrc: "/images/gym-hero.jpg",
        location: "Porto · Vila Nova de Gaia",
        description:
          "Complexo aquático com pistas de treino e hidroginástica.",
        activitiesCount: 4,
        minCredits: 8,
        partnerType: "pool_access",
        address: "Rua do Cais 50, Vila Nova de Gaia",
        city: "Vila Nova de Gaia",
        latitude: 41.1332,
        longitude: -8.6174,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1332,-8.6174",
      },
      {
        id: "blue-water-center",
        name: "Blue Water Center",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Benfica",
        description: "Piscina olímpica e pista de aquagym.",
        activitiesCount: 6,
        minCredits: 8,
        partnerType: "pool_access",
        address: "Av. General Norton de Matos 1",
        city: "Lisboa",
        latitude: 38.7512,
        longitude: -9.1924,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7512,-9.1924",
      },
      {
        id: "atlantic-pool-studio",
        name: "Atlantic Pool Studio",
        imageSrc: "/images/gym-hero.jpg",
        location: "Porto · Matosinhos",
        description: "Natação e hidroterapia com vista para o mar.",
        activitiesCount: 5,
        minCredits: 8,
        partnerType: "pool_access",
        address: "Av. da Praia 88, Matosinhos",
        city: "Matosinhos",
        latitude: 41.1782,
        longitude: -8.6924,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1782,-8.6924",
      },
    ],
  },
};

export type MockActivity = {
  id: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  credits: number;
  spots: number;
  location?: string;
};

/** Mock activities per partner id for the partner activities page. Only for class_booking, court_booking, pool_access. */
export const MOCK_ACTIVITIES_BY_PARTNER: Record<string, MockActivity[]> = {
  "clube-padel-lisboa": [
    {
      id: "cp-1",
      title: "Pista 1 - 1h",
      date: "10/03/2026",
      time: "14:00",
      durationMinutes: 60,
      credits: 10,
      spots: 4,
      location: "Campo indoor",
    },
    {
      id: "cp-2",
      title: "Pista 2 - 1h",
      date: "10/03/2026",
      time: "16:00",
      durationMinutes: 60,
      credits: 10,
      spots: 4,
    },
  ],
  "padel-line-porto": [
    {
      id: "pl-1",
      title: "Reserva Pista",
      date: "11/03/2026",
      time: "18:00",
      durationMinutes: 60,
      credits: 10,
      spots: 4,
      location: "Matosinhos",
    },
  ],
  "zen-yoga-lisboa": [
    {
      id: "zy-1",
      title: "Vinyasa Flow",
      date: "10/03/2026",
      time: "08:00",
      durationMinutes: 60,
      credits: 8,
      spots: 12,
      location: "Estúdio principal",
    },
    {
      id: "zy-2",
      title: "Yin Yoga",
      date: "11/03/2026",
      time: "19:00",
      durationMinutes: 75,
      credits: 8,
      spots: 10,
    },
  ],
  "flow-yoga-porto": [
    {
      id: "fy-1",
      title: "Yoga ao Nascer do Sol",
      date: "12/03/2026",
      time: "07:00",
      durationMinutes: 60,
      credits: 8,
      spots: 15,
      location: "Foz",
    },
  ],
  "pulse-cycling": [
    {
      id: "pc-1",
      title: "Cycling 45'",
      date: "10/03/2026",
      time: "19:00",
      durationMinutes: 45,
      credits: 8,
      spots: 20,
      location: "Campo Pequeno",
    },
  ],
  "core-pilates": [
    {
      id: "cpl-1",
      title: "Pilates Reformer",
      date: "11/03/2026",
      time: "10:30",
      durationMinutes: 55,
      credits: 8,
      spots: 8,
      location: "Cedofeita",
    },
  ],
  "smash-court-club": [
    { id: "scc-1", title: "Pista 1h", date: "10/03/2026", time: "15:00", durationMinutes: 60, credits: 10, spots: 4, location: "Belém" },
  ],
  "arena-padel-studio": [
    { id: "aps-1", title: "Reserva Pista", date: "11/03/2026", time: "18:00", durationMinutes: 60, credits: 10, spots: 4, location: "Campanhã" },
  ],
  "alma-studio-lisboa": [
    { id: "asl-1", title: "Yoga & Mindfulness", date: "10/03/2026", time: "09:00", durationMinutes: 60, credits: 8, spots: 14, location: "Lapa" },
    { id: "asl-2", title: "Vinyasa", date: "12/03/2026", time: "18:30", durationMinutes: 75, credits: 8, spots: 12 },
  ],
  "reformer-pilates-club": [
    { id: "rpc-1", title: "Pilates Reformer", date: "11/03/2026", time: "10:00", durationMinutes: 55, credits: 8, spots: 8, location: "Chiado" },
  ],
  "mind-body-studio": [
    { id: "mbs-1", title: "HIIT 45'", date: "10/03/2026", time: "19:00", durationMinutes: 45, credits: 8, spots: 16, location: "Foz" },
  ],
  "urban-flow-studio": [
    { id: "ufs-1", title: "Barre & Flow", date: "11/03/2026", time: "09:30", durationMinutes: 60, credits: 8, spots: 12, location: "Arroios" },
  ],
  "porto-crossfit-box": [
    { id: "pcb-1", title: "WOD", date: "10/03/2026", time: "18:30", durationMinutes: 60, credits: 10, spots: 14, location: "Bonfim" },
  ],
  "forge-training-club": [
    { id: "ftc-1", title: "WOD Manhã", date: "10/03/2026", time: "07:00", durationMinutes: 60, credits: 10, spots: 12, location: "Alcântara" },
  ],
  "alpha-box-lisboa": [
    { id: "abl-1", title: "WOD", date: "10/03/2026", time: "07:00", durationMinutes: 60, credits: 10, spots: 12, location: "Alfama" },
  ],
  "motion-lab-crossfit": [
    { id: "mlc-1", title: "Metcon", date: "11/03/2026", time: "18:00", durationMinutes: 60, credits: 10, spots: 14, location: "Ramalde" },
  ],
  "blue-water-center": [
    { id: "bwc-1", title: "Natação Livre", date: "10/03/2026", time: "12:00", durationMinutes: 60, credits: 8, spots: 20, location: "Benfica" },
  ],
  "atlantic-pool-studio": [
    { id: "aps2-1", title: "Pista de Treino", date: "11/03/2026", time: "08:00", durationMinutes: 60, credits: 8, spots: 12, location: "Matosinhos" },
  ],
  "aqua-lisboa": [
    { id: "aq-1", title: "Natação Livre", date: "10/03/2026", time: "12:00", durationMinutes: 60, credits: 8, spots: 16, location: "Telheiras" },
  ],
  "wave-porto": [
    { id: "wv-1", title: "Pista de Treino", date: "11/03/2026", time: "08:00", durationMinutes: 60, credits: 8, spots: 10, location: "Vila Nova de Gaia" },
  ],
};

export function getPartnerBySlugAndId(
  slug: string,
  partnerId: string
): { categoryLabel: string; partner: Partner } | null {
  const category = CATEGORY_PARTNERS[slug];
  if (!category) return null;
  const partner = category.partners.find((p) => p.id === partnerId);
  if (!partner) return null;
  return { categoryLabel: category.label, partner };
}

/** Demo: simulated user location (Lisbon). */
export const DEMO_USER_LAT = 38.7223;
export const DEMO_USER_LON = -9.1393;

/** Approximate distance in km using Haversine formula. */
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Format distance for display: < 1 km → meters (e.g. 860 m), ≥ 1 km → km (e.g. 2.3 km). */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${Number(km.toFixed(1))} km`;
}

export type PartnerWithCategory = Partner & { categorySlug: string; categoryLabel: string };

/** All partners with their category slug and label (for nearby discovery). */
export function getAllPartnersWithCategory(): PartnerWithCategory[] {
  const result: PartnerWithCategory[] = [];
  for (const [slug, data] of Object.entries(CATEGORY_PARTNERS)) {
    for (const partner of data.partners) {
      result.push({
        ...partner,
        categorySlug: slug,
        categoryLabel: data.label,
      });
    }
  }
  return result;
}

export type GetPartnersNearbyOptions = {
  /** Max distance in km (default 10). Only partners within this radius. */
  maxDistanceKm?: number;
  /** Max number of partners to return (default 4). */
  maxResults?: number;
};

/** Partners nearby: within maxDistanceKm, sorted by distance, limited to maxResults. */
export function getPartnersNearby(
  userLat: number = DEMO_USER_LAT,
  userLon: number = DEMO_USER_LON,
  options: GetPartnersNearbyOptions = {}
): PartnerWithCategory[] {
  const { maxDistanceKm = 10, maxResults = 4 } = options;
  const all = getAllPartnersWithCategory();
  const withCoords = all.filter(
    (p): p is PartnerWithCategory & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null
  );
  const withDistance = withCoords
    .map((p) => ({ p, km: distanceKm(userLat, userLon, p.latitude, p.longitude) }))
    .filter(({ km }) => km <= maxDistanceKm)
    .sort((a, b) => a.km - b.km);
  return withDistance.slice(0, maxResults).map(({ p }) => p);
}

export function getMockActivitiesForPartner(partnerId: string): MockActivity[] {
  return MOCK_ACTIVITIES_BY_PARTNER[partnerId] ?? [];
}

export function getMockActivity(
  partnerId: string,
  activityId: string
): MockActivity | null {
  const list = MOCK_ACTIVITIES_BY_PARTNER[partnerId] ?? [];
  return list.find((a) => a.id === activityId) ?? null;
}
