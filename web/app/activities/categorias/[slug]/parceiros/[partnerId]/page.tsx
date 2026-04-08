"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import SectionHeader from "@/app/components/ui/SectionHeader";
import HeroBackground from "@/app/components/ui/HeroBackground";

type Partner = {
  _id: string;
  name: string;
  description?: string;
  city?: string;
  address?: string;
  location?: string;
  image?: string;
  coverImage?: string;
  category?: string;
  categories?: string[];
};

type Activity = {
  _id: string;
  title?: string;
  name?: string;
  partnerId?: string;
  partner?: { _id?: string };
  startDate?: string;
  startTime?: string;
  date?: string;
  durationMinutes?: number;
  duration?: number;
  creditsCost?: number;
  credits?: number;
  availableSpots?: number;
  capacity?: number;
  description?: string;
  tags?: string[];
  active?: boolean;
};

function formatDate(value?: string) {
  if (!value) return "Data a confirmar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatTime(activity: Activity) {
  if (activity.startTime) return activity.startTime;
  if (activity.startDate) {
    const date = new Date(activity.startDate);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  }
  return "Hora a confirmar";
}

export default function PartnerPage() {
  const params = useParams<{ slug: string; partnerId: string }>();
  const slug = decodeURIComponent(params?.slug ?? "");
  const partnerId = decodeURIComponent(params?.partnerId ?? "");

  const [partner, setPartner] = useState<Partner | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const [partnersData, activitiesData] = await Promise.all([
          apiFetch<Partner[]>("/partners"),
          apiFetch<Activity[]>("/activities"),
        ]);

        if (!alive) return;

        const partners = Array.isArray(partnersData) ? partnersData : [];
        const allActivities = Array.isArray(activitiesData) ? activitiesData : [];

        const foundPartner = partners.find((p) => p._id === partnerId) || null;

        setPartner(foundPartner);

        if (!foundPartner) {
          setActivities([]);
          setError("Parceiro não encontrado.");
          return;
        }


        // FILTRO FINAL: só igualdade direta por _id
        const filteredActivities = allActivities.filter((activity) => {
          return (
            activity.partnerId === foundPartner._id ||
            activity.partner?._id === foundPartner._id
          );
        });

        setActivities(filteredActivities);
      } catch (err) {
        console.error("Erro ao carregar parceiro/atividades:", err);
        if (!alive) return;
        setError("Erro ao carregar dados do parceiro.");
        setActivities([]);
        setPartner(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (partnerId) load();

    return () => {
      alive = false;
    };
  }, [partnerId, slug]);

  const partnerHeadline = useMemo(() => {
    if (!partner) return "Parceiro";
    return partner.location || partner.city || partner.address || "Parceiro premium";
  }, [partner]);

  async function handleReserve(activityId: string) {
    if (!activityId) return;

    setReservingId(activityId);
    setError("");
    setSuccess("");

    try {
      await apiFetch("/reservations", {
        method: "POST",
        body: JSON.stringify({ activityId }),
      });

      setSuccess("Reserva criada com sucesso.");
    } catch (err) {
      console.error("Erro ao reservar:", err);
      setError("Não foi possível concluir a reserva.");
    } finally {
      setReservingId(null);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#06101f] via-[#0a1f52] to-[#1037b7] pb-24">
      <HeroBackground overlay="premium" height="activities" className="w-full rounded-b-3xl">
        <div className="mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 pt-16 sm:px-6 lg:px-8">
          <Link
            href={`/activities/categorias/${slug}`}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-md transition hover:bg-white/15"
          >
            ← Voltar aos parceiros
          </Link>

          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.24em] text-white/60">
              {slug || "Categoria"}
            </p>
            <h1 className="mb-3 text-4xl font-extrabold text-white drop-shadow-lg md:text-5xl">
              {partner?.name ?? "Parceiro premium"}
            </h1>
            <p className="mb-3 text-lg text-white/80">{partnerHeadline}</p>
            {partner?.description ? (
              <p className="max-w-2xl text-sm leading-7 text-white/70">{partner.description}</p>
            ) : null}
          </div>
        </div>
      </HeroBackground>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <SectionHeader
          title="Atividades disponíveis"
          subtitle="Escolhe a tua sessão e reserva com créditos reais."
          variant="app"
          className="mb-8"
        />

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm text-red-100 backdrop-blur-md">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-6 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100 backdrop-blur-md">
            {success}
          </div>
        ) : null}

        {loading ? (
          <GlassCard
            variant="dark"
            className="rounded-[28px] border border-white/10 bg-white/8 p-8 text-center text-white/75"
          >
            A carregar atividades...
          </GlassCard>
        ) : activities.length === 0 ? (
          <GlassCard
            variant="dark"
            className="rounded-[28px] border border-white/10 bg-white/8 p-8 text-center text-white/75"
          >
            Nenhuma atividade disponível para este parceiro.
          </GlassCard>
        ) : (
          <div className="space-y-5">
            {activities.map((activity) => {
              const activityId = activity._id || activity.id || "";
              const title = activity.title || activity.name || "Sessão";
              const credits = activity.creditsCost ?? activity.credits ?? 0;
              const duration = activity.durationMinutes ?? activity.duration;
              const availableSpots = activity.availableSpots ?? activity.capacity;
              const location =
                activity.location || activity.address || activity.city || partner?.location || partner?.city;

              return (
                <GlassCard
                  key={activityId}
                  variant="dark"
                  hover
                  className="overflow-hidden rounded-[30px] border border-white/12 bg-white/10 p-0 shadow-[0_20px_60px_rgba(13,36,110,0.32)] backdrop-blur-2xl"
                >
                  <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-7">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                        {activity.type ? (
                          <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">
                            {activity.type}
                          </span>
                        ) : null}
                      </div>

                      <div className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-white/55">
                        {partner?.name}
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                          {formatDate(activity.startDate || activity.date)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                          {formatTime(activity)}
                        </span>
                        {duration ? (
                          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                            {duration} min
                          </span>
                        ) : null}
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                          {credits} créditos
                        </span>
                        {typeof availableSpots === "number" ? (
                          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                            {availableSpots} vagas disponíveis
                          </span>
                        ) : null}
                      </div>

                      {location ? (
                        <p className="mb-3 text-sm text-white/72">{location}</p>
                      ) : null}

                      {activity.description ? (
                        <p className="max-w-3xl text-sm leading-7 text-white/65">{activity.description}</p>
                      ) : null}

                      {Array.isArray(activity.tags) && activity.tags.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {activity.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-blue-300/15 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-100"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => handleReserve(activityId)}
                        disabled={!activityId || reservingId === activityId}
                        className="rounded-full bg-gradient-to-r from-[#2b69ff] via-[#3485ff] to-[#46b6ff] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(58,112,255,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reservingId === activityId ? "A reservar..." : "Reservar"}
                      </button>

                      <Link
                        href={`/activities/${activityId}`}
                        className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white/90 transition hover:bg-white/15"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}