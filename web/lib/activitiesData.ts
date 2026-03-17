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
  /** Optional provider profile (e.g., freelancer Personal Trainer). */
  provider?: {
    type: "trainer";
    specialties: string[];
    certifications?: string[];
    experienceYears?: number;
    bio?: string;
  };
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
  danca: {
    label: "Dança",
    partners: [
      {
        id: "dance-lab-lisboa",
        name: "Dance Lab Lisboa",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Príncipe Real",
        description: "Aulas de dança para todos os níveis: hip hop, contemporâneo e mais.",
        activitiesCount: 8,
        minCredits: 7,
        partnerType: "class_booking",
        address: "Rua da Escola Politécnica 12",
        city: "Lisboa",
        latitude: 38.7139,
        longitude: -9.1492,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7139,-9.1492",
      },
      {
        id: "rhythm-studio-porto",
        name: "Rhythm Studio",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Porto · Cedofeita",
        description: "Salsa, ritmos latinos e aulas energéticas em ambiente premium.",
        activitiesCount: 6,
        minCredits: 7,
        partnerType: "class_booking",
        address: "Rua de Cedofeita 210",
        city: "Porto",
        latitude: 41.1559,
        longitude: -8.6221,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1559,-8.6221",
      },
    ],
  },
  pilates: {
    label: "Pilates",
    partners: [
      {
        id: "pilates-house-lisboa",
        name: "Pilates House",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Avenidas Novas",
        description: "Pilates mat e postural com foco em core, postura e mobilidade.",
        activitiesCount: 10,
        minCredits: 7,
        partnerType: "class_booking",
        address: "Av. 5 de Outubro 88",
        city: "Lisboa",
        latitude: 38.7337,
        longitude: -9.1462,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7337,-9.1462",
      },
      {
        id: "pilates-porto-core",
        name: "Porto Core Pilates",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Porto · Boavista",
        description: "Sessões de pilates para força, estabilidade e recuperação.",
        activitiesCount: 8,
        minCredits: 7,
        partnerType: "class_booking",
        address: "Rua da Boavista 980",
        city: "Porto",
        latitude: 41.1595,
        longitude: -8.6475,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1595,-8.6475",
      },
    ],
  },
  "pilates-reformer": {
    label: "Pilates Reformer",
    partners: [
      {
        id: "reformer-lab-lisboa",
        name: "Reformer Lab",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Chiado",
        description: "Pilates reformer em estúdio premium com vagas limitadas.",
        activitiesCount: 6,
        minCredits: 10,
        partnerType: "class_booking",
        address: "Rua do Carmo 22",
        city: "Lisboa",
        latitude: 38.7107,
        longitude: -9.1418,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7107,-9.1418",
      },
      {
        id: "reformer-porto-studio",
        name: "Reformer Porto Studio",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Porto · Foz",
        description: "Reformer e treino de core com foco em técnica e postura.",
        activitiesCount: 6,
        minCredits: 10,
        partnerType: "class_booking",
        address: "Av. Brasil 410",
        city: "Porto",
        latitude: 41.1533,
        longitude: -8.6735,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1533,-8.6735",
      },
    ],
  },
  "massagem-desportiva": {
    label: "Massagem desportiva",
    partners: [
      {
        id: "recovery-lab-lisboa",
        name: "Recovery Lab",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Saldanha",
        description: "Recuperação e massagem desportiva para performance e bem-estar.",
        activitiesCount: 6,
        minCredits: 12,
        partnerType: "class_booking",
        address: "Av. da República 12",
        city: "Lisboa",
        latitude: 38.7351,
        longitude: -9.1451,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7351,-9.1451",
      },
      {
        id: "recovery-porto-center",
        name: "Recovery Porto Center",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Porto · Aliados",
        description: "Massagem e terapia manual com foco em recuperação desportiva.",
        activitiesCount: 6,
        minCredits: 12,
        partnerType: "class_booking",
        address: "Praça da Liberdade 18",
        city: "Porto",
        latitude: 41.1481,
        longitude: -8.6107,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1481,-8.6107",
      },
    ],
  },
  nutricao: {
    label: "Nutrição",
    partners: [
      {
        id: "nutri-care-lisboa",
        name: "NutriCare Lisboa",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Lisboa · Campo Pequeno",
        description: "Consultas de nutrição e planos alimentares personalizados.",
        activitiesCount: 6,
        minCredits: 8,
        partnerType: "class_booking",
        address: "Av. João XXI 16",
        city: "Lisboa",
        latitude: 38.7422,
        longitude: -9.1459,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7422,-9.1459",
      },
      {
        id: "nutri-porto-studio",
        name: "Nutri Porto Studio",
        imageSrc: "/images/fitness-hero.jpg",
        location: "Porto · Boavista",
        description: "Acompanhamento nutricional para performance, saúde e recomposição corporal.",
        activitiesCount: 6,
        minCredits: 8,
        partnerType: "class_booking",
        address: "Rua de Júlio Dinis 780",
        city: "Porto",
        latitude: 41.1582,
        longitude: -8.6408,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1582,-8.6408",
      },
    ],
  },
  "personal-training": {
    label: "Personal training",
    partners: [
      {
        id: "trainer-miguel-santos",
        name: "Miguel Santos",
        imageSrc: "/images/trainer-miguel.jpg",
        location: "Lisboa · Parque das Nações",
        description: "Treino individual premium com foco em força, técnica e consistência.",
        activitiesCount: 6,
        minCredits: 12,
        partnerType: "class_booking",
        provider: {
          type: "trainer",
          specialties: ["Hipertrofia", "Perda de peso", "Treino funcional"],
          certifications: ["NSCA-CPT"],
          experienceYears: 8,
          bio: "Sessões personalizadas ao teu nível, com progressão e foco em resultados sustentáveis.",
        },
        city: "Lisboa",
        latitude: 38.7676,
        longitude: -9.0954,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7676,-9.0954",
      },
      {
        id: "trainer-ines-ribeiro",
        name: "Inês Ribeiro",
        imageSrc: "/images/trainer-ines.jpg",
        location: "Porto · Foz",
        description: "Performance, mobilidade e preparação física com abordagem premium.",
        activitiesCount: 6,
        minCredits: 12,
        partnerType: "class_booking",
        provider: {
          type: "trainer",
          specialties: ["Performance", "Mobilidade", "Strength & Conditioning"],
          certifications: ["CrossFit L1"],
          experienceYears: 6,
          bio: "Treino orientado para performance com atenção à mobilidade e prevenção de lesões.",
        },
        city: "Porto",
        latitude: 41.1518,
        longitude: -8.6748,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1518,-8.6748",
      },
      {
        id: "trainer-carolina-matos",
        name: "Carolina Matos",
        imageSrc: "/images/trainer-carolina.jpg",
        location: "Lisboa · Saldanha",
        description: "Força e hipertrofia com técnica e progressão inteligente.",
        activitiesCount: 6,
        minCredits: 12,
        partnerType: "class_booking",
        provider: {
          type: "trainer",
          specialties: ["Hipertrofia", "Pós-parto", "Técnica de levantamento"],
          certifications: ["NASM-CPT"],
          experienceYears: 7,
          bio: "Ideal para ganhar massa e melhorar técnica com uma estrutura clara e segura.",
        },
        city: "Lisboa",
        latitude: 38.7349,
        longitude: -9.1456,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7349,-9.1456",
      },
      {
        id: "trainer-joao-ferreira",
        name: "João Ferreira",
        imageSrc: "/images/trainer-joao.jpg",
        location: "Porto · Boavista",
        description: "Mobilidade, core e postura para complementar qualquer plano.",
        activitiesCount: 6,
        minCredits: 12,
        partnerType: "class_booking",
        provider: {
          type: "trainer",
          specialties: ["Mobilidade", "Reabilitação / treino funcional", "Core"],
          certifications: ["FMS"],
          experienceYears: 5,
          bio: "Sessões para melhorar mobilidade e estabilidade. Excelente para prevenção e recuperação.",
        },
        city: "Porto",
        latitude: 41.1592,
        longitude: -8.6469,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=41.1592,-8.6469",
      },
      {
        id: "trainer-rui-almeida",
        name: "Rui Almeida",
        imageSrc: "/images/trainer-rui.jpg",
        location: "Lisboa · Alcântara",
        description: "Performance e treino funcional com foco em evolução consistente.",
        activitiesCount: 6,
        minCredits: 12,
        partnerType: "class_booking",
        provider: {
          type: "trainer",
          specialties: ["Performance", "Perda de peso", "Strength & Conditioning"],
          certifications: ["Strength & Conditioning"],
          experienceYears: 9,
          bio: "Planeamento e sessões premium para quem quer evoluir rápido com consistência.",
        },
        city: "Lisboa",
        latitude: 38.7021,
        longitude: -9.1778,
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=38.7021,-9.1778",
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
  /** Optional peak/off-peak label for pricing context. */
  peakLabel?: string;
  /** Optional trainer/provider details (e.g., personal training). */
  trainer?: {
    name: string;
    avatarSrc?: string;
    specialties: string[];
    certifications?: string[];
    experienceYears?: number;
    /** Display location for the trainer/session. */
    location: string;
    bio?: string;
  };
};

/** Format date as DD/MM/YYYY for display. */
function formatDateYMD(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Convert DD/MM/YYYY to YYYY-MM-DD for reservation storage and comparisons. */
export function activityDateToISO(ddMmYyyy: string): string {
  const parts = ddMmYyyy.trim().split("/");
  if (parts.length !== 3) return ddMmYyyy;
  const [day, month, year] = parts;
  return `${year}-${month!.padStart(2, "0")}-${day!.padStart(2, "0")}`;
}

/** Slot template for generating activities (today + next 7 days). */
type ActivitySlot = {
  title: string;
  time: string;
  durationMinutes: number;
  credits: number;
  spots: number;
  location?: string;
  peakLabel?: string;
  trainer?: MockActivity["trainer"];
};

/** Weekly slot templates per partner (class_booking, court_booking, pool_access). */
const ACTIVITY_SLOTS_BY_PARTNER: Record<string, ActivitySlot[]> = {
  "clube-padel-lisboa": [
    { title: "Pista 1 - 1h", time: "14:00", durationMinutes: 60, credits: 10, spots: 4, location: "Campo indoor" },
    { title: "Pista 2 - 1h", time: "16:00", durationMinutes: 60, credits: 10, spots: 4 },
  ],
  "padel-line-porto": [
    { title: "Reserva Pista", time: "18:00", durationMinutes: 60, credits: 10, spots: 4, location: "Matosinhos" },
  ],
  "zen-yoga-lisboa": [
    { title: "Vinyasa Flow", time: "08:00", durationMinutes: 60, credits: 8, spots: 12, location: "Estúdio principal" },
    { title: "Yin Yoga", time: "19:00", durationMinutes: 75, credits: 8, spots: 10 },
  ],
  "flow-yoga-porto": [
    { title: "Yoga ao Nascer do Sol", time: "07:00", durationMinutes: 60, credits: 8, spots: 15, location: "Foz" },
  ],
  "pulse-cycling": [
    { title: "Cycling 45'", time: "19:00", durationMinutes: 45, credits: 8, spots: 20, location: "Campo Pequeno" },
  ],
  "core-pilates": [
    { title: "Pilates Reformer", time: "10:30", durationMinutes: 55, credits: 8, spots: 8, location: "Cedofeita" },
  ],
  "smash-court-club": [
    { title: "Pista 1h", time: "15:00", durationMinutes: 60, credits: 10, spots: 4, location: "Belém" },
  ],
  "arena-padel-studio": [
    { title: "Reserva Pista", time: "18:00", durationMinutes: 60, credits: 10, spots: 4, location: "Campanhã" },
  ],
  "alma-studio-lisboa": [
    { title: "Yoga & Mindfulness", time: "09:00", durationMinutes: 60, credits: 8, spots: 14, location: "Lapa" },
    { title: "Vinyasa", time: "18:30", durationMinutes: 75, credits: 8, spots: 12 },
  ],
  "reformer-pilates-club": [
    { title: "Pilates Reformer", time: "10:00", durationMinutes: 55, credits: 8, spots: 8, location: "Chiado" },
  ],
  "mind-body-studio": [
    { title: "HIIT 45'", time: "19:00", durationMinutes: 45, credits: 8, spots: 16, location: "Foz" },
  ],
  "urban-flow-studio": [
    { title: "Barre & Flow", time: "09:30", durationMinutes: 60, credits: 8, spots: 12, location: "Arroios" },
  ],
  // Dança
  "dance-lab-lisboa": [
    { title: "Dança Contemporânea", time: "19:30", durationMinutes: 60, credits: 7, spots: 18, location: "Príncipe Real" },
    { title: "Hip Hop Basics", time: "18:00", durationMinutes: 55, credits: 7, spots: 20, location: "Príncipe Real" },
  ],
  "rhythm-studio-porto": [
    { title: "Salsa Social", time: "20:00", durationMinutes: 60, credits: 7, spots: 22, location: "Cedofeita" },
  ],
  // Pilates
  "pilates-house-lisboa": [
    { title: "Pilates Mat", time: "08:30", durationMinutes: 55, credits: 7, spots: 14, location: "Avenidas Novas" },
    { title: "Pilates Postural", time: "18:30", durationMinutes: 55, credits: 7, spots: 12, location: "Avenidas Novas" },
  ],
  "pilates-porto-core": [
    { title: "Pilates Core", time: "19:00", durationMinutes: 55, credits: 7, spots: 14, location: "Boavista" },
  ],
  // Pilates Reformer (mais premium)
  "reformer-lab-lisboa": [
    { title: "Pilates Reformer", time: "10:00", durationMinutes: 55, credits: 10, spots: 8, location: "Chiado", peakLabel: "Premium" },
    { title: "Reformer Strong", time: "18:00", durationMinutes: 55, credits: 10, spots: 8, location: "Chiado", peakLabel: "Premium" },
  ],
  "reformer-porto-studio": [
    { title: "Pilates Reformer", time: "09:00", durationMinutes: 55, credits: 10, spots: 8, location: "Foz", peakLabel: "Premium" },
  ],
  // Massagem desportiva
  "recovery-lab-lisboa": [
    { title: "Massagem desportiva 45'", time: "12:30", durationMinutes: 45, credits: 12, spots: 1, location: "Saldanha", peakLabel: "Recuperação" },
    { title: "Massagem de recuperação 60'", time: "18:30", durationMinutes: 60, credits: 14, spots: 1, location: "Saldanha", peakLabel: "Recuperação" },
  ],
  "recovery-porto-center": [
    { title: "Massagem desportiva 45'", time: "17:30", durationMinutes: 45, credits: 12, spots: 1, location: "Aliados", peakLabel: "Recuperação" },
  ],
  // Nutrição
  "nutri-care-lisboa": [
    { title: "Consulta de nutrição (45')", time: "11:00", durationMinutes: 45, credits: 10, spots: 1, location: "Campo Pequeno", peakLabel: "Suporte" },
    { title: "Plano alimentar (follow-up)", time: "18:00", durationMinutes: 30, credits: 8, spots: 1, location: "Campo Pequeno", peakLabel: "Suporte" },
  ],
  "nutri-porto-studio": [
    { title: "Consulta de nutrição (45')", time: "19:00", durationMinutes: 45, credits: 10, spots: 1, location: "Boavista", peakLabel: "Suporte" },
  ],
  // Personal training (freelancer trainers)
  "trainer-miguel-santos": [
    {
      title: "Personal training 60'",
      time: "07:30",
      durationMinutes: 60,
      credits: 15,
      spots: 1,
      location: "Parque das Nações (outdoor)",
      peakLabel: "Premium",
      trainer: {
        name: "Miguel Santos",
        avatarSrc: "/images/trainer-miguel.jpg",
        specialties: ["Hipertrofia", "Perda de peso", "Treino funcional"],
        certifications: ["NSCA-CPT", "Treino funcional"],
        experienceYears: 8,
        location: "Lisboa · Parque das Nações",
        bio: "Foco em força, técnica e consistência. Sessões personalizadas ao teu nível.",
      },
    },
    {
      title: "Personal training 45'",
      time: "18:30",
      durationMinutes: 45,
      credits: 12,
      spots: 1,
      location: "FitClub Lisboa (Saldanha)",
      peakLabel: "Premium",
      trainer: {
        name: "Miguel Santos",
        avatarSrc: "/images/trainer-miguel.jpg",
        specialties: ["Hipertrofia", "Perda de peso", "Treino funcional"],
        certifications: ["NSCA-CPT", "Treino funcional"],
        experienceYears: 8,
        location: "Lisboa · Parque das Nações",
        bio: "Foco em força, técnica e consistência. Sessões personalizadas ao teu nível.",
      },
    },
  ],
  "trainer-ines-ribeiro": [
    {
      title: "Personal training 60'",
      time: "19:00",
      durationMinutes: 60,
      credits: 15,
      spots: 1,
      location: "Porto · Foz (outdoor)",
      peakLabel: "Premium",
      trainer: {
        name: "Inês Ribeiro",
        avatarSrc: "/images/trainer-ines.jpg",
        specialties: ["Performance", "Mobilidade", "Strength & Conditioning"],
        certifications: ["CrossFit L1", "Mobilidade"],
        experienceYears: 6,
        location: "Porto · Foz",
        bio: "Sessões orientadas para performance com atenção à mobilidade e prevenção de lesões.",
      },
    },
  ],
  "trainer-carolina-matos": [
    {
      title: "Personal training 60'",
      time: "08:00",
      durationMinutes: 60,
      credits: 15,
      spots: 1,
      location: "Lisboa · Saldanha",
      peakLabel: "Premium",
      trainer: {
        name: "Carolina Matos",
        avatarSrc: "/images/trainer-carolina.jpg",
        specialties: ["Hipertrofia", "Pós-parto", "Técnica de levantamento"],
        certifications: ["NASM-CPT"],
        experienceYears: 7,
        location: "Lisboa · Saldanha",
        bio: "Treino de força com progressão inteligente. Ideal para ganhar massa e melhorar técnica.",
      },
    },
  ],
  "trainer-joao-ferreira": [
    {
      title: "Personal training 45'",
      time: "18:00",
      durationMinutes: 45,
      credits: 12,
      spots: 1,
      location: "Porto · Boavista",
      peakLabel: "Premium",
      trainer: {
        name: "João Ferreira",
        avatarSrc: "/images/trainer-joao.jpg",
        specialties: ["Mobilidade", "Reabilitação / treino funcional", "Core"],
        certifications: ["FMS", "Mobilidade"],
        experienceYears: 5,
        location: "Porto · Boavista",
        bio: "Sessões para melhorar mobilidade, postura e estabilidade. Excelente complemento ao treino.",
      },
    },
  ],
  "trainer-rui-almeida": [
    {
      title: "Personal training 60'",
      time: "19:30",
      durationMinutes: 60,
      credits: 15,
      spots: 1,
      location: "Lisboa · Alcântara",
      peakLabel: "Premium",
      trainer: {
        name: "Rui Almeida",
        avatarSrc: "/images/trainer-rui.jpg",
        specialties: ["Performance", "Perda de peso", "Strength & Conditioning"],
        certifications: ["Strength & Conditioning"],
        experienceYears: 9,
        location: "Lisboa · Alcântara",
        bio: "Planeamento de treino e performance para quem quer evoluir rápido com consistência.",
      },
    },
  ],
  "porto-crossfit-box": [
    { title: "WOD", time: "18:30", durationMinutes: 60, credits: 10, spots: 14, location: "Bonfim" },
  ],
  "forge-training-club": [
    { title: "WOD Manhã", time: "07:00", durationMinutes: 60, credits: 10, spots: 12, location: "Alcântara" },
  ],
  "alpha-box-lisboa": [
    { title: "WOD", time: "07:00", durationMinutes: 60, credits: 10, spots: 12, location: "Alfama" },
  ],
  "motion-lab-crossfit": [
    { title: "Metcon", time: "18:00", durationMinutes: 60, credits: 10, spots: 14, location: "Ramalde" },
  ],
  "blue-water-center": [
    { title: "Natação Livre", time: "12:00", durationMinutes: 60, credits: 8, spots: 20, location: "Benfica" },
  ],
  "atlantic-pool-studio": [
    { title: "Pista de Treino", time: "08:00", durationMinutes: 60, credits: 8, spots: 12, location: "Matosinhos" },
  ],
  "aqua-lisboa": [
    { title: "Natação Livre", time: "12:00", durationMinutes: 60, credits: 8, spots: 16, location: "Telheiras" },
  ],
  "wave-porto": [
    { title: "Pista de Treino", time: "08:00", durationMinutes: 60, credits: 8, spots: 10, location: "Vila Nova de Gaia" },
  ],
};

/** Generate activities for today and the next 7 days. */
export function getMockActivitiesForPartner(partnerId: string): MockActivity[] {
  // Public source of truth (configured in Partner Backoffice). Falls back to legacy mock slots if absent.
  try {
    // Lazy import to avoid circular deps in module load.
    const { getPublicSessionsForPartnerRange, publicSessionsToMockActivities } =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("@/lib/publicAvailability") as typeof import("@/lib/publicAvailability");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minISO = today.toISOString().slice(0, 10);
    const max = new Date(today);
    max.setDate(max.getDate() + 7);
    const maxISO = max.toISOString().slice(0, 10);
    const sessions = getPublicSessionsForPartnerRange({ partnerId, minISO, maxISO });
    if (Array.isArray(sessions) && sessions.length > 0) {
      return publicSessionsToMockActivities(sessions);
    }
  } catch {
    // ignore; use legacy mocks
  }

  const slots = ACTIVITY_SLOTS_BY_PARTNER[partnerId];
  if (!slots || slots.length === 0) return [];
  const activities: MockActivity[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    const dateStr = formatDateYMD(d);
    slots.forEach((slot, slotIndex) => {
      activities.push({
        id: `${partnerId}-${dayOffset}-${slotIndex}`,
        title: slot.title,
        date: dateStr,
        time: slot.time,
        durationMinutes: slot.durationMinutes,
        credits: slot.credits,
        spots: slot.spots,
        location: slot.location,
        peakLabel: slot.peakLabel,
        trainer: slot.trainer,
      });
    });
  }
  return activities;
}

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

export function getMockActivity(
  partnerId: string,
  activityId: string
): MockActivity | null {
  const list = getMockActivitiesForPartner(partnerId);
  return list.find((a) => a.id === activityId) ?? null;
}
