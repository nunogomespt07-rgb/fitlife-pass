"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  activityDateToISO,
  getMockActivity,
  getPartnerBySlugAndId,
} from "@/lib/activitiesData";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";

export default function ActivityDetailPage() {
  const params = useParams() as {
    slug?: string | string[];
    partnerId?: string | string[];
    activityId?: string | string[];
  };
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug ?? "";
  const partnerId = Array.isArray(params.partnerId)
    ? params.partnerId[0]
    : params.partnerId ?? "";
  const activityId = Array.isArray(params.activityId)
    ? params.activityId[0]
    : params.activityId ?? "";

  const resolved = getPartnerBySlugAndId(slug, partnerId);
  const activity = getMockActivity(partnerId, activityId);
  const { addReservation, countReservationsForActivity } = useMockReservations();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reservedCount = resolved && activity ? countReservationsForActivity(partnerId, activityId) : 0;
  const availableSpots = activity ? Math.max(0, activity.spots - reservedCount) : 0;

  const handleReservar = useCallback(() => {
    if (!activity || !resolved || availableSpots <= 0) return;
    const { partner } = resolved;
    const isPadel = partner.partnerType === "court_booking";
    const perPersonCredits = isPadel ? 10 : activity.credits;
    // Detalhe não tem seletor de pessoas – assumimos 2 jogadores por omissão em padel
    const effectivePeople = isPadel ? 2 : 1;
    const totalCredits = perPersonCredits * effectivePeople;
    setErrorMessage(null);
    const result = addReservation({
      activityId,
      activityTitle: activity.title,
      partnerId,
      partnerName: partner.name,
      categorySlug: slug,
      date: activityDateToISO(activity.date),
      time: activity.time,
      creditsRequired: totalCredits,
      location: activity.location,
    });
    if (result.success) {
      setSuccessMessage(
        `Reserva confirmada para "${activity.title}". ${totalCredits} crédito${totalCredits !== 1 ? "s" : ""} utilizados. Aparece em Conta → Reservas ativas.`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      setErrorMessage(result.error ?? "Erro ao reservar.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  }, [activity, resolved, slug, partnerId, activityId, availableSpots, addReservation]);

  if (!resolved || !activity) {
    return (
      <div className="page-bg min-h-screen font-sans text-white">
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
          <GlassCard variant="dark" padding="lg">
            <p className="text-sm font-medium text-white">
              Atividade não encontrada.
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
  const partnerActivitiesUrl = `/activities/categorias/${slug}/parceiros/${partnerId}`;

  return (
    <div className="page-bg min-h-screen font-sans text-white">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-white/80">
          <Link href="/activities" className="font-medium transition hover:text-white">
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
          <Link
            href={partnerActivitiesUrl}
            className="font-medium transition hover:text-white"
          >
            {partner.name}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-white">{activity.title}</span>
        </nav>

        <div className="mt-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {activity.title}
          </h1>
          <p className="mt-2 text-sm font-medium text-white/80">
            {partner.name} · {partner.location}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <GlassCard variant="dark" padding="lg" className="rounded-2xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Informação
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Local</dt>
                <dd className="font-medium text-white">
                  {activity.location ?? partner.location}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Data</dt>
                <dd className="font-medium text-white">{activity.date}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Hora</dt>
                <dd className="font-medium text-white">{activity.time}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Duração</dt>
                <dd className="font-medium text-white">
                  {activity.durationMinutes} min
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Créditos</dt>
                <dd className="font-medium text-white">
                  {partner.partnerType === "court_booking"
                    ? `${activity.credits} crédito${activity.credits !== 1 ? "s" : ""} por jogador`
                    : `${activity.credits} crédito${activity.credits !== 1 ? "s" : ""}`}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/60">Vagas disponíveis</dt>
                <dd className="font-medium text-white">{availableSpots}</dd>
              </div>
            </dl>
          </GlassCard>

          <GlassCard variant="dark" padding="lg" className="rounded-2xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Descrição
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              {partner.description}
            </p>
          </GlassCard>

          {successMessage && (
            <GlassCard
              variant="dark"
              padding="md"
              className="border-emerald-400/30 bg-emerald-500/10"
            >
              <p className="text-sm text-emerald-100">{successMessage}</p>
            </GlassCard>
          )}
          {errorMessage && (
            <GlassCard
              variant="dark"
              padding="md"
              className="border-red-400/30 bg-red-500/10"
            >
              <p className="text-sm text-red-100">{errorMessage}</p>
            </GlassCard>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <PrimaryButton
              variant="primary"
              onClick={handleReservar}
              disabled={availableSpots <= 0}
              className="min-w-[160px]"
            >
              {availableSpots <= 0 ? "Esgotado" : "Reservar"}
            </PrimaryButton>
            <Link
              href={partnerActivitiesUrl}
              className="text-sm font-medium text-white/80 underline-offset-2 hover:text-white hover:underline"
            >
              ← Voltar às atividades do parceiro
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
