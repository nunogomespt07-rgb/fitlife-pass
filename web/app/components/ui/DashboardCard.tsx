"use client";

import GlassCard from "./GlassCard";

type DashboardCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export default function DashboardCard({
  title,
  subtitle,
  children,
  className = "",
}: DashboardCardProps) {
  return (
    <GlassCard variant="dark" padding="lg" className={className}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-xs text-white/65">{subtitle}</p>
      )}
      <div className="mt-5">{children}</div>
    </GlassCard>
  );
}
