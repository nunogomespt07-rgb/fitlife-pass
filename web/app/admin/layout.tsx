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
      {/* Top bar: primary nav + utility actions */}
      <header className="admin-topbar sticky top-0 z-30 border-b border-white/[0.08] bg-slate-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
              FitLife Pass · Admin
            </p>
            <nav className="flex items-center gap-0.5" aria-label="Secções do backoffice">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive(item.href)
                      ? "admin-nav-tab admin-nav-tab-active rounded-lg px-3 py-2 text-sm font-medium text-white"
                      : "admin-nav-tab rounded-lg px-3 py-2 text-sm font-medium text-white/75 hover:bg-white/[0.06] hover:text-white/90"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
                router.replace("/admin/login");
              }}
              className="admin-util-btn rounded-lg px-3 py-2 text-sm text-white/65 hover:bg-white/[0.06] hover:text-white/85"
              aria-label="Terminar sessão"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 lg:px-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Backoffice Admin
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Gestão interna da plataforma (parceiros, créditos, visibilidade e operações).
          </p>
        </div>

        <div className="admin-area">{children}</div>
      </main>
    </div>
  );
}

