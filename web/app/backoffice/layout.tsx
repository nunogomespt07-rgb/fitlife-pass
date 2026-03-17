"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getAllPartnersWithCategory, type PartnerWithCategory } from "@/lib/activitiesData";
import { getAuthedBackofficePartnerId, clearBackofficeSession } from "@/lib/backofficeAuth";
import { clearCurrentBackofficePartner } from "@/lib/backofficePartner";

const navItems: { href: string; label: string }[] = [
  { href: "/backoffice", label: "Agenda" },
  { href: "/backoffice/reservas", label: "Reservas" },
  { href: "/backoffice/sessoes", label: "Sessões" },
  { href: "/backoffice/estatisticas", label: "Estatísticas" },
  { href: "/backoffice/financeiro", label: "Financeiro" },
  { href: "/backoffice/perfil", label: "Perfil" },
];

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/backoffice" ? pathname === href : pathname.startsWith(href);

  const partners = useMemo(() => getAllPartnersWithCategory(), []);
  const [partner, setPartner] = useState<PartnerWithCategory | null>(null);

  useEffect(() => {
    const pid = getAuthedBackofficePartnerId();
    if (!pid) {
      // Allow login route without redirect loop
      if (pathname.startsWith("/backoffice/login")) return;
      window.location.assign("/backoffice/login");
      return;
    }
    setPartner(partners.find((p) => p.id === pid) ?? null);
  }, [pathname, partners]);

  return (
    <div className="page-bg page-bg-dashboard text-white font-sans min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
              FitLife Pass · Backoffice
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {partner ? partner.name : "Parceiros"}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              {partner ? `${partner.categoryLabel} · ${partner.location}` : "Gestão de disponibilidade, sessões, reservas e performance."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive(item.href)
                    ? "rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/8 hover:border-white/20"
                }
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                clearBackofficeSession();
                clearCurrentBackofficePartner();
                window.location.assign("/backoffice/login");
              }}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/8 hover:border-white/20"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}

