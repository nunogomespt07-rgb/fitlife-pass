"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  activityDateToISO,
  getMockActivitiesForPartner,
  getPartnerBySlugAndId,
} from "@/lib/activitiesData";
import type { MockActivity } from "@/lib/activitiesData";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import type { UnifiedReservation } from "@/lib/unifiedReservations";
import { useFavorites } from "@/app/context/FavoritesContext";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import FavoriteButton from "@/app/components/ui/FavoriteButton";
import GymEntryQRModal from "@/app/components/ui/GymEntryQRModal";

export default function PartnerActivitiesPage() {
  const params = useParams() as {
    slug?: string | string[];
    partnerId?: string | string[];
  };
  const rawSlug = params.slug;
  const rawPartnerId = params.partnerId;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug ?? "";
  const partnerId = Array.isArray(rawPartnerId)
    ? rawPartnerId[0]
    : rawPartnerId ?? "";

  const resolved = getPartnerBySlugAndId(slug, partnerId);
  const initialActivities = useMemo(
    () => getMockActivitiesForPartner(partnerId),
    [partnerId]
  );
  const { addReservation, addGymReservation, countReservationsForActivity } = useMockReservations();
  const { toggleActivityPartner, isActivityPartnerFavorite } = useFavorites();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gymReservation, setGymReservation] = useState<UnifiedReservation | null>(null);
  const [padelReservarActivity, setPadelReservarActivity] = useState<MockActivity | null>(null);
  const [padelPlayerCount, setPadelPlayerCount] = useState(2);

  const isPadelPartner = resolved?.partner.partnerType === "court_booking";

  const handleReservar = useCallback(
    (act: MockActivity, participantCount?: number) => {
      if (!resolved) return;
      const { partner } = resolved;
      const reservedCount = countReservationsForActivity(partnerId, act.id);
      const availableSpots = Math.max(0, act.spots - reservedCount);
      if (availableSpots <= 0) return;
      setErrorMessage(null);
      setPadelReservarActivity(null);
      const isPadel = partner.partnerType === "court_booking";
      const perPersonCredits = isPadel ? 10 : act.credits;
      const effectivePeople = isPadel ? (participantCount ?? 1) : 1;
      const totalCredits = perPersonCredits * effectivePeople;
      const result = addReservation({
        activityId: act.id,
        activityTitle: act.title,
        partnerId,
        partnerName: partner.name,
        categorySlug: slug,
        date: activityDateToISO(act.date),
        time: act.time,
        creditsRequired: totalCredits,
        location: act.location,
        participantCount,
      });
      if (result.success) {
        setSuccessMessage(
          `Reserva confirmada para "${act.title}". ${totalCredits} crédito${totalCredits !== 1 ? "s" : ""} utilizados. Aparece em Conta → Reservas ativas.`
        );
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(result.error ?? "Erro ao reservar.");
        setTimeout(() => setErrorMessage(null), 5000);
      }
    },
    [resolved, slug, partnerId, addReservation, countReservationsForActivity]
  );

  const handleReservarClick = useCallback(
    (act: MockActivity) => {
      if (!resolved) return;
      const reservedCount = countReservationsForActivity(partnerId, act.id);
      const availableSpots = Math.max(0, act.spots - reservedCount);
      if (availableSpots <= 0) return;
      setErrorMessage(null);
      if (isPadelPartner) {
        setPadelPlayerCount(2);
        setPadelReservarActivity(act);
        return;
      }
      handleReservar(act, undefined);
    },
    [resolved, partnerId, countReservationsForActivity, isPadelPartner, handleReservar]
  );

  if (!resolved) {
    return (
      <div className="page-bg min-h-screen font-sans text-white">
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
          <GlassCard variant="dark" padding="lg">
            <p className="text-sm font-medium text-white">
              Parceiro ou categoria não encontrados.
            </p>
            <Link
              href="/activities"
              className="mt-4 inline-flex text-sm font-medium text-white/80 underline-offset-2 hover:underline"
            >
              ← Voltar às atividades
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  const { categoryLabel, partner } = resolved;
  const isGymAccess = partner.partnerType === "gym_access";

  return (
    <div className="page-bg min-h-screen font-sans text-white">
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <nav className="flex items-center gap-2 text-sm text-white/80">
          <Link
            href="/activities"
            className="font-medium transition hover:text-white"
          >
            Atividades
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={`/activities/categorias/${slug}`}
            className="font-medium transition hover:text-white"
          >
            {categoryLabel}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-white">{partner.name}</span>
        </nav>

        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {partner.name}
            </h1>
            <p className="mt-1 text-sm text-white/75">{partner.location}</p>
            <p className="mt-2 text-sm text-white/65">{partner.description}</p>
            {partner.address && partner.city && (
              <p className="mt-3 text-sm text-white/70">
                {partner.address} · {partner.city}
              </p>
            )}
          </div>
          <FavoriteButton
            isFavorite={isActivityPartnerFavorite(slug, partner.id)}
            onToggle={() => toggleActivityPartner(slug, partner.id, categoryLabel, partner.name)}
          />
        </div>

        {isGymAccess ? (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Acesso ao ginásio
            </h2>
            <GlassCard
              variant="dark"
              padding="lg"
              className="rounded-2xl border-white/12 bg-white/5 backdrop-blur-xl"
            >
              {partner.openingHours && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Horário de funcionamento
                  </p>
                  <p className="mt-1.5 font-medium text-white">
                    {partner.openingHours}
                  </p>
                </div>
              )}
              {partner.fitlifePassHours && (
                <div className={partner.openingHours ? "mt-5" : ""}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Horário FitLife Pass
                  </p>
                  <p className="mt-1.5 text-sm text-white/90">
                    {partner.fitlifePassHours}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Acesso FitLife Pass apenas nestes horários.
                  </p>
                </div>
              )}
              <div className={partner.openingHours || partner.fitlifePassHours ? "mt-5" : ""}>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Créditos
                </p>
                <p className="mt-1.5 font-medium text-white">
                  {(partner.creditsPerEntry ?? partner.minCredits ?? 1)} crédito
                  {(partner.creditsPerEntry ?? partner.minCredits ?? 1) !== 1 ? "s" : ""} por entrada
                </p>
              </div>
              <PrimaryButton
                variant="primary"
                className="mt-6 w-full sm:w-auto"
                onClick={() => {
                  setErrorMessage(null);
                  const credits = partner.creditsPerEntry ?? partner.minCredits ?? 6;
                  const result = addGymReservation({
                    partnerId: partner.id,
                    partnerName: partner.name,
                    creditsRequired: credits,
                  });
                  if (result.success && result.reservation) {
                    setGymReservation(result.reservation);
                    setSuccessMessage(`Acesso reservado. ${credits} crédito${credits !== 1 ? "s" : ""} utilizados. QR válido por 8 horas.`);
                    setTimeout(() => setSuccessMessage(null), 6000);
                  } else {
                    setErrorMessage(result.error ?? "Erro ao reservar acesso.");
                    setTimeout(() => setErrorMessage(null), 5000);
                  }
                }}
              >
                Entrar agora
              </PrimaryButton>
            </GlassCard>
          </section>
        ) : (
        <section className="mt-10">
          <h2 className="mb-6 text-lg font-semibold text-white">
            Atividades disponíveis
          </h2>
          {successMessage && (
            <GlassCard
              variant="dark"
              padding="md"
              className="mb-6 border-emerald-400/30 bg-emerald-500/10"
            >
              <p className="text-sm text-emerald-100">{successMessage}</p>
            </GlassCard>
          )}
          {errorMessage && (
            <GlassCard
              variant="dark"
              padding="md"
              className="mb-6 border-red-400/30 bg-red-500/10"
            >
              <p className="text-sm text-red-100">{errorMessage}</p>
            </GlassCard>
          )}
          <div className="space-y-4">
            {initialActivities.length === 0 ? (
              <GlassCard variant="dark" padding="lg">
                <p className="text-sm text-white/80">
                  Não há atividades disponíveis para reserva neste momento.
                </p>
                <Link
                  href={`/activities/categorias/${slug}`}
                  className="mt-4 inline-flex text-sm font-medium text-white/80 underline-offset-2 hover:underline"
                >
                  ← Voltar aos parceiros
                </Link>
              </GlassCard>
            ) : (
              initialActivities.map((act) => {
                const reservedCount = countReservationsForActivity(partnerId, act.id);
                const availableSpots = Math.max(0, act.spots - reservedCount);
                const isPersonalTraining = slug === "personal-training" && !!act.trainer?.name;
                return (
                <GlassCard
                  key={act.id}
                  variant="dark"
                  padding="lg"
                  className="rounded-2xl border-white/12 bg-white/5 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-white">
                        {isPersonalTraining ? act.trainer!.name : act.title}
                      </h3>
                      {isPersonalTraining && (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/60">
                          Personal Trainer
                        </p>
                      )}
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/75">
                        <li>{act.date}</li>
                        <li>{act.time}</li>
                        <li>{act.durationMinutes} min</li>
                        <li>
                          {isPadelPartner
                            ? `${act.credits} crédito${act.credits !== 1 ? "s" : ""} por jogador`
                            : `${act.credits} crédito${act.credits !== 1 ? "s" : ""}`}
                        </li>
                        <li>
                          {availableSpots} vagas disponíveis
                        </li>
                        {act.location && (
                          <li className="text-white/65">{act.location}</li>
                        )}
                      </ul>
                      {isPersonalTraining && act.trainer!.specialties.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {act.trainer!.specialties.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/80"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      <PrimaryButton
                        variant="primary"
                        className="min-w-[140px]"
                        onClick={() => handleReservarClick(act)}
                        disabled={availableSpots <= 0}
                      >
                        {availableSpots <= 0 ? "Esgotado" : "Reservar"}
                      </PrimaryButton>
                      <Link
                        href={`/activities/categorias/${slug}/parceiros/${partnerId}/atividades/${act.id}`}
                        className="text-sm font-medium text-white/80 underline-offset-2 hover:text-white hover:underline"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              );
              })
            )}
          </div>
        </section>
        )}

        {(partner.address ?? partner.city ?? partner.googleMapsUrl) && (
          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white">
              📍 Localização
            </h2>
            <GlassCard
              variant="dark"
              padding="lg"
              className="rounded-2xl border border-white/12 bg-white/5 shadow-lg shadow-black/10 backdrop-blur-xl"
            >
              {partner.address && (
                <p className="font-medium text-white">{partner.address}</p>
              )}
              {partner.city && (
                <p className="mt-1 text-sm text-white/75">{partner.city}</p>
              )}
              {partner.latitude != null && partner.longitude != null && (
                <div className="mt-4 h-[210px] w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <iframe
                    title={`Mapa: ${partner.name}`}
                    src={`https://www.google.com/maps?q=${partner.latitude},${partner.longitude}&z=15&output=embed`}
                    className="h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
              {(partner.googleMapsUrl ?? (partner.latitude != null && partner.longitude != null)) && (
                <a
                  href={
                    partner.googleMapsUrl ??
                    `https://www.google.com/maps/search/?api=1&query=${partner.latitude},${partner.longitude}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 hover:border-white/30 active:scale-[0.98]"
                >
                  Abrir no Google Maps
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </GlassCard>
          </section>
        )}

        <div className="mt-10">
          <Link
            href={`/activities/categorias/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
          >
            ← Voltar aos parceiros
          </Link>
        </div>

        {gymReservation && (
          <GymEntryQRModal
            partner={partner}
            reservation={gymReservation}
            onClose={() => setGymReservation(null)}
          />
        )}

        {padelReservarActivity && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="padel-players-title"
          >
            <div
              className="absolute inset-0 bg-[#0b1e4d]/80 backdrop-blur-sm"
              onClick={() => setPadelReservarActivity(null)}
              aria-hidden
            />
            <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/12 bg-white/[0.08] p-6 shadow-2xl backdrop-blur-xl">
              <h2 id="padel-players-title" className="text-lg font-semibold text-white">
                Número de jogadores
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Escolhe quantos jogadores para esta reserva.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPadelPlayerCount(n)}
                    className={`rounded-xl border px-5 py-3 text-sm font-medium transition ${
                      padelPlayerCount === n
                        ? "border-blue-400/50 bg-blue-500/20 text-white"
                        : "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryButton
                  variant="primary"
                  onClick={() => handleReservar(padelReservarActivity, padelPlayerCount)}
                >
                  Confirmar reserva
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setPadelReservarActivity(null)}
                  className="rounded-full border border-white/22 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
