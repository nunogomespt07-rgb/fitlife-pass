/**
 * Definições do onboarding pós-registo (objetivos e preferências).
 * Valores guardados em fitlife-user (StoredUser) e reutilizáveis na app.
 */

export const ONBOARDING_TOTAL_STEPS = 6;

export const ONBOARDING_GOAL_OPTIONS = [
  { id: "lose_weight", label: "Perder peso" },
  { id: "gain_muscle", label: "Ganhar massa muscular" },
  { id: "improve_fitness", label: "Melhorar condição física" },
  { id: "relax", label: "Relaxar / reduzir stress" },
  { id: "stay_active", label: "Manter-me ativo" },
] as const;

export const ONBOARDING_FREQUENCY_OPTIONS = [
  { id: "1-2", label: "1–2x por semana" },
  { id: "3-4", label: "3–4x por semana" },
  { id: "5+", label: "5x+ por semana" },
] as const;

/** Lista completa de categorias (etapa 5 do onboarding) — ids estáveis para Mongo `interests`. */
export const ONBOARDING_CATEGORY_INTEREST_OPTIONS = [
  { id: "gym", label: "Ginásio" },
  { id: "crossfit", label: "CrossFit" },
  { id: "yoga", label: "Yoga" },
  { id: "pilates", label: "Pilates" },
  { id: "pilates_reformer", label: "Pilates Reformer" },
  { id: "padel", label: "Padel" },
  { id: "personal_training", label: "Personal Training" },
  { id: "swimming", label: "Piscinas/Natação" },
  { id: "dance", label: "Dança" },
  { id: "sports_massage", label: "Massagem desportiva" },
  { id: "nutrition", label: "Nutrição" },
  { id: "recovery_wellbeing", label: "Recovery/Bem-estar" },
  { id: "healthy_food", label: "Healthy Food" },
  { id: "hiit", label: "HIIT" },
  { id: "combat", label: "Combate" },
  { id: "functional_bootcamp", label: "Funcional/Bootcamp" },
] as const;

/** @deprecated Preferir ONBOARDING_CATEGORY_INTEREST_OPTIONS na etapa 5. */
export const ONBOARDING_INTEREST_OPTIONS = ONBOARDING_CATEGORY_INTEREST_OPTIONS;

export const ONBOARDING_EXPERIENCE_OPTIONS = [
  { id: "beginner", label: "Iniciante" },
  { id: "intermediate", label: "Intermédio" },
  { id: "advanced", label: "Avançado" },
] as const;

export const ONBOARDING_TIME_OPTIONS = [
  { id: "morning", label: "Manhã" },
  { id: "afternoon", label: "Tarde" },
  { id: "evening", label: "Noite" },
  { id: "weekend", label: "Fins de semana" },
] as const;

export const ONBOARDING_HEALTHY_FOOD_OPTIONS = [
  { id: "yes", label: "Sim" },
  { id: "maybe", label: "Talvez" },
  { id: "no", label: "Não" },
] as const;

export type OnboardingAnswersPayload = {
  goal: string;
  weeklyFrequency: string;
  interests: string[];
  experienceLevel: string;
  preferredTimes: string[];
  healthyFoodInterest: string;
};
