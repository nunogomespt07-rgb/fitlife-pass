/**
 * Camada de normalização canónica para integração (atividades/parceiros/reservas).
 * IDs estáveis: o id exposto na UI (ex. partnerId-dayOffset-slotIndex) é a appStableKey.
 */

import type { Partner } from "@/lib/activitiesData";

export type NormalizedPartner = {
  id: string;
  name: string;
  categorySlug?: string;
  city?: string;
  partnerType?: string;
};

export type NormalizedActivity = {
  appStableKey: string;
  partnerClientSlug: string;
  title: string;
  sportType: string;
  dateISO: string;
  time: string;
  creditsCost: number;
  maxParticipants: number;
  location?: string;
};

export type ActivitySnapshotPayload = {
  appStableKey: string;
  activityId?: string;
  partnerClientSlug: string;
  title: string;
  sportType: string;
  dateISO: string;
  time: string;
  creditsCost: number;
  maxParticipants: number;
  location?: string;
};

export function normalizePartner(
  partner: Partner,
  categorySlug: string
): NormalizedPartner {
  return {
    id: partner.id,
    name: partner.name,
    categorySlug,
    city: partner.city ?? undefined,
    partnerType: partner.partnerType,
  };
}

/** A partir de um slot mock ou API — dateISO = YYYY-MM-DD */
export function normalizeActivity(params: {
  activityId: string;
  partnerClientSlug: string;
  categorySlug: string;
  title: string;
  dateISO: string;
  time: string;
  credits: number;
  spots: number;
  location?: string;
}): NormalizedActivity {
  return {
    appStableKey: String(params.activityId).trim(),
    partnerClientSlug: params.partnerClientSlug,
    title: params.title,
    sportType: params.categorySlug,
    dateISO: params.dateISO,
    time: params.time,
    creditsCost: Math.max(0, Math.floor(params.credits)),
    maxParticipants: Math.max(1, Math.floor(params.spots)),
    location: params.location,
  };
}

/**
 * Payload enviado ao Express quando o id não é ObjectId Mongo (modo integração).
 * creditsCost = custo total da reserva (ex. padel × jogadores já refletido em creditsRequired).
 */
export function normalizeBookingPayload(input: {
  activityId: string;
  partnerId: string;
  categorySlug: string;
  activityTitle: string;
  /** YYYY-MM-DD */
  date: string;
  time: string;
  creditsRequired: number;
  location?: string;
  /** Vagas do slot (capacidade); obrigatório para maxParticipants fiável */
  activitySpots?: number;
}): ActivitySnapshotPayload {
  const appStableKey = String(input.activityId).trim();
  const maxParticipants = Math.max(1, Math.floor(input.activitySpots ?? 24));
  return {
    appStableKey,
    activityId: appStableKey,
    partnerClientSlug: String(input.partnerId).trim(),
    title: String(input.activityTitle || "Atividade").slice(0, 200),
    sportType: String(input.categorySlug || "geral").slice(0, 200),
    dateISO: String(input.date || "").trim().slice(0, 10),
    time: String(input.time || "12:00").trim(),
    creditsCost: Math.max(0, Math.floor(input.creditsRequired)),
    maxParticipants,
    location: input.location,
  };
}
