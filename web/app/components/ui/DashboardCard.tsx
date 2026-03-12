"use client";

import GlassCard from "./GlassCard";

type DashboardCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  /** Credits hero card: gradient + radial glow + large number */
  hero?: boolean;
};

export default function DashboardCard({
  title,
  subtitle,
  children,
  className = "",
  hero = false,
}: DashboardCardProps) {
  const cardClassName = hero
    ? "relative overflow-hidden rounded-[22px] border border-white/10 " +
      "bg-[linear-gradient(135deg,#3a6cff_0%,#1d4ed8_100%)] " +
      "shadow-[0_16px_48px_rgba(58,108,255,0.4)]"
    : "";

  return (
    <GlassCard
      variant={hero ? "dark" : "app"}
      padding="lg"
      className={`${cardClassName} ${className}`}
    >
      {hero && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_40%)]"
          aria-hidden
        />
      )}
      <h2 className="relative text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
        {title}
      </h2>
      {subtitle && (
        <p className="relative mt-2 text-sm text-white/70">{subtitle}</p>
      )}
      <div className="mt-5 relative">{children}</div>
    </GlassCard>
  );
}
