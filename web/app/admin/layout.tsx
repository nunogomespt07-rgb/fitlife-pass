"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "./admin.css";

const navItems: { href: string; label: string }[] = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/financas", label: "Finanças" },
  { href: "/admin/parceiros", label: "Parceiros" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  // Login route must not show authenticated admin chrome.
  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/session", { method: "GET" });
        setAuthed(res.ok);
        if (!res.ok) {
          const next = pathname;
          console.log("[admin layout] redirect to login", { reason: "session not ok", next });
          router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
        }
      } catch (e) {
        setAuthed(false);
        const next = pathname;
        console.log("[admin layout] redirect to login", { reason: "fetch error", error: String(e), next });
        router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
      }
    })();
  }, [pathname, router]);

  if (authed === false) {
    return <>{children}</>;
  }

  return (
    <div className="page-bg page-bg-dashboard text-white font-sans min-h-screen">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
              FitLife Pass · Admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Backoffice Admin
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Gestão interna da plataforma (parceiros, créditos peak/off-peak, visibilidade e operações).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <span className="ml-2 h-6 w-px border-l border-white/20" aria-hidden />
            <button
              type="button"
              onClick={() => {
                fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
                router.replace("/admin/login");
              }}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/8 hover:border-white/20"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="admin-area mt-10">{children}</div>
      </div>
    </div>
  );
}

