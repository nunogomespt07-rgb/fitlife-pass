"use client";

import Link from "next/link";
import GlassCard from "./GlassCard";
import type { ApiActivity } from "@/lib/api";

type ActivityCardProps = {
  activity: ApiActivity;
  formatDate: (dateStr: string | undefined) => string;
  /** Show "Reservar" button (links to detail page) */
  showReserveButton?: boolean;
  /** Animation delay in ms for stagger */
  animationDelay?: number;
};

export default function ActivityCard({
  activity,
  formatDate,
  showReserveButton = true,
  animationDelay = 0,
}: ActivityCardProps) {
  const href = `/activities/${activity._id}`;

  return (
    <Link
      href={href}
      className="group block opacity-0 animate-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <GlassCard hover active padding="md" variant="dark" as="div">
        <div className="flex flex-col gap-3">
          <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-white">
            {activity.title}
          </h2>
          {activity.creditsCost != null && (
            <span className="rounded-full bg-white/[0.1] w-fit px-2.5 py-0.5 text-xs font-medium text-white">
              {activity.creditsCost} créditos
            </span>
          )}
          <dl className="space-y-1 text-xs text-white/70">
            {activity.location != null && activity.location !== "" && (
              <div className="flex justify-between gap-2">
                <dt className="text-white/50">Local</dt>
                <dd>{activity.location}</dd>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <dt className="text-white/50">Data</dt>
              <dd>{formatDate(activity.date)}</dd>
            </div>
            {activity.maxParticipants != null && (
              <div className="flex justify-between gap-2">
                <dt className="text-white/50">Vagas disponíveis</dt>
                <dd>{activity.maxParticipants}</dd>
              </div>
            )}
          </dl>
          {showReserveButton && (
            <div className="mt-2 pt-2 border-t border-white/[0.08]">
              <span className="inline-flex w-full items-center justify-center rounded-[22px] bg-white px-5 py-3.5 text-sm font-semibold text-[#0a1628] shadow-lg shadow-blue-950/30 transition group-hover:bg-white/95 group-hover:shadow-xl active:scale-[0.98]">
                Reservar
              </span>
            </div>
          )}
          <p className="flex items-center gap-1 text-xs font-medium text-white/80 transition group-hover:translate-x-0.5">
            Ver detalhes →
          </p>
        </div>
      </GlassCard>
    </Link>
  );
}
