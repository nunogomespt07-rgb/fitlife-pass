"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useNotifications } from "@/app/context/NotificationsContext";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import { getStoredUser, getStoredUserDisplayName } from "@/lib/storedUser";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";
import { RESTAURANTS } from "@/lib/restaurantsData";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  subscriptionPlanId?: string | null;
  subscriptionPlanName?: string | null;
} | null;

function readStoredUser(): StoredUser {
  return getStoredUser();
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { unreadCount } = useNotifications();
  const { credits } = useMockReservations();
  const [hasToken, setHasToken] = useState(false);
  const [user, setUser] = useState<StoredUser>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setHasToken(!!token || !!session?.user);
    const stored = readStoredUser();
    if (stored) {
      setUser(stored);
    } else if (session?.user) {
      const nameFromSession = session.user.name?.trim();
      const newUser = {
        id: (session.user as { id?: string }).id ?? (session.user.email ?? ""),
        name: nameFromSession && nameFromSession.length > 0 ? nameFromSession : "",
        email: session.user.email ?? "",
        subscriptionPlanId: null as string | null,
        subscriptionPlanName: null as string | null,
      };
      setUser(newUser);
      try {
        const payload = {
          ...newUser,
          image: (session.user as { image?: string }).image ?? null,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("fitlife-user", JSON.stringify(payload));
      } catch {
        // ignore
      }
    } else {
      setUser(null);
    }
  }, [pathname, session]);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [searchOpen]);

  const isActive = (path: string) => pathname === path;

  const isPublicRoute =
    pathname === "/" ||
    pathname === "/register" ||
    pathname.startsWith("/onboarding");
  const isAuthRoute =
    pathname === "/" || pathname === "/register";
  const isOnboardingOrRegister =
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/onboarding");
  const showAuthenticatedUI = hasToken && !isPublicRoute;

  const navLinkBase =
    "rounded-full px-4 py-2.5 text-sm font-medium tracking-tight text-white/80 transition-all duration-200 hover:text-white hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-white/15 focus:ring-offset-2 focus:ring-offset-transparent";
  const navLinkActive = "bg-white/[0.08] text-white";

  const displayName = getStoredUserDisplayName() || user?.name?.trim().split(/\s+/)[0] || "";
  const firstName = displayName || "Utilizador";
  const avatarLetter = (firstName.charAt(0) || "U").toUpperCase();
  const planName = user?.subscriptionPlanName ?? null;
  const planLabel = planName ? `Plano ${planName.replace(/^FitLife\s+/i, "")}` : null;

  function normalize(str: string | undefined | null): string {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  const allSearchItems = useMemo(() => {
    const partners = getAllPartnersWithCategory().map((p) => ({
      id: `act-${p.categorySlug}-${p.id}`,
      name: p.name,
      category: p.categoryLabel,
      city: p.city ?? "",
      location: p.location ?? "",
      href: `/activities/categorias/${p.categorySlug}/parceiros/${p.id}`,
      kind: "activity" as const,
    }));
    const restaurants = RESTAURANTS.map((r) => ({
      id: `rest-${r.id}`,
      name: r.name,
      category: "Healthy Food",
      city: r.city ?? "",
      location: r.location ?? "",
      href: `/activities/categorias/healthy-food/restaurantes/${r.id}`,
      kind: "restaurant" as const,
    }));
    return [...partners, ...restaurants];
  }, []);

  const filteredSearchItems = useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return [];
    return allSearchItems
      .filter((item) => {
        const haystack = [
          item.name,
          item.category,
          item.city,
          item.location,
        ]
          .map(normalize)
          .join(" ");
        return haystack.includes(q);
      })
      .slice(0, 8);
  }, [allSearchItems, searchQuery]);

  const showSearchResults = searchOpen && searchQuery.length > 0;

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("fitlife-user");
    }
    setHasToken(false);
    setUser(null);
    setDropdownOpen(false);
    signOut({ callbackUrl: "/" }).then(() => router.push("/"));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[rgba(15,25,50,0.65)] shadow-[0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[16px] supports-[backdrop-filter]:bg-[rgba(15,25,50,0.65)]">
      <nav className="mobileHeader mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:gap-6 sm:px-6 lg:px-10">
        <div className="mobileHeaderLeft flex items-center gap-2.5 sm:gap-4 min-w-0">
          <Link
            href={showAuthenticatedUI ? "/dashboard" : "/"}
            className="flex items-center rounded-full text-white/90 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/15 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            <span className="text-[1.25rem] font-[600] tracking-[-0.03em]">
              FitLife
            </span>
            <span className="ml-1.5 text-[0.95rem] font-[400] tracking-[-0.02em] text-white/75">
              Pass
            </span>
          </Link>

          {showAuthenticatedUI && (
            <div className="relative flex flex-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 shadow-sm backdrop-blur-md">
              <svg
                className="mr-2 mt-[2px] h-4 w-4 shrink-0 text-white/50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Pesquisar parceiros (Lisboa, Yoga, Terra...)"
                className="w-full bg-transparent text-xs text-white/90 placeholder:text-white/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                    searchInputRef.current?.blur();
                  }}
                  className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/80 hover:bg-white/20"
                >
                  Limpar
                </button>
              )}
              {showSearchResults && (
                <div className="absolute left-0 top-full z-40 mt-1 w-full rounded-2xl border border-white/14 bg-[#020617]/90 py-1.5 text-sm shadow-[0_18px_40px_rgba(15,23,42,0.7)] backdrop-blur-2xl">
                  {filteredSearchItems.length === 0 ? (
                    <div className="px-3.5 py-2 text-xs text-white/70">
                      Sem resultados.
                    </div>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto">
                      {filteredSearchItems.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => {
                              router.push(item.href);
                              setSearchOpen(false);
                              setSearchQuery("");
                              searchInputRef.current?.blur();
                            }}
                            className="flex w-full flex-col items-start px-3.5 py-2 text-left text-xs text-white/90 transition hover:bg-white/10"
                          >
                            <span className="font-medium truncate">{item.name}</span>
                            <span className="mt-0.5 text-[11px] text-white/65">
                              {item.category}
                              {item.city || item.location ? (
                                <>
                                  {" · "}
                                  {item.city || item.location}
                                </>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side – nav links + notifications + avatar */}
        <div className="mobileHeaderRight flex items-center gap-2.5 sm:gap-4">
          {!isOnboardingOrRegister && !isAuthRoute && (
            <Link
              href="/activities"
              className={`hidden md:inline-flex ${navLinkBase} ${isActive("/activities") ? navLinkActive : ""}`}
            >
              Atividades
            </Link>
          )}
          {showAuthenticatedUI && (
            <div className="hidden items-center gap-2.5 md:flex">
              <Link
                href="/dashboard/reservas"
                className={`${navLinkBase} ${isActive("/dashboard/reservas") ? navLinkActive : ""}`}
              >
                Reservas
              </Link>
              <Link
                href="/dashboard/qr-codes"
                className={`${navLinkBase} ${isActive("/dashboard/qr-codes") ? navLinkActive : ""}`}
              >
                Check-in
              </Link>
            </div>
          )}
          {showAuthenticatedUI ? (
            <div className="relative ml-1 sm:ml-2" ref={dropdownRef}>
              <div className="flex items-center gap-[10px] sm:gap-4">
                {/* Notification bell – visible on mobile and desktop */}
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/notifications")}
                  className="notificationButton relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 shadow-sm backdrop-blur-md transition hover:bg-white/10"
                  aria-label={unreadCount > 0 ? `${unreadCount} notificações por ler` : "Notificações"}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && <span className="notificationBadge" />}
                </button>
                {(planLabel !== null || credits !== undefined) && (
                  <span
                    className="hidden sm:inline-flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium tracking-tight text-white/90"
                  >
                    <span className="font-semibold text-white/95">
                      {planLabel ?? "Sem plano"}
                    </span>
                    <span className="h-3 w-px bg-white/20" aria-hidden />
                    <span className="text-white/70 tabular-nums">
                      {credits} crédito{credits === 1 ? "" : "s"}
                    </span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.04] pl-3 pr-3.5 py-1.5 text-xs font-semibold text-white/95 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.12] focus:outline-none focus:ring-2 focus:ring-white/15 focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.25] bg-white/[0.15] text-[12px] font-bold text-white"
                    aria-hidden
                  >
                    {avatarLetter}
                  </span>
                  <span className="hidden sm:inline max-w-[140px] truncate text-white">{firstName}</span>
                  <svg
                    className={`h-3.5 w-3.5 shrink-0 text-white/50 transition duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 min-w-[220px] rounded-2xl border border-white/[0.12] bg-[#020617]/80 py-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.7)] backdrop-blur-3xl"
                  role="menu"
                >
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-lg mx-1.5 px-3.5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    role="menuitem"
                  >
                    Conta
                  </Link>
                  <Link
                    href="/dashboard/perfil"
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-lg mx-1.5 px-3.5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    role="menuitem"
                  >
                    Perfil
                  </Link>
                  <Link
                    href="/dashboard/favoritos"
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-lg mx-1.5 px-3.5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    role="menuitem"
                  >
                    Favoritos
                  </Link>
                  <Link
                    href="/dashboard/pagamentos"
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-lg mx-1.5 px-3.5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    role="menuitem"
                  >
                    Pagamentos
                  </Link>
                  <Link
                    href="/dashboard/convidar"
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-lg mx-1.5 px-3.5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    role="menuitem"
                  >
                    Convidar amigos
                  </Link>
                  <Link
                    href="/faq"
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-lg mx-1.5 px-3.5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    role="menuitem"
                  >
                    FAQ
                  </Link>
                  <div className="my-1.5 border-t border-white/[0.06]" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-lg mx-1.5 px-3.5 py-2.5 text-left text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                    role="menuitem"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isOnboardingOrRegister && !isAuthRoute && (
              <Link
                href="/"
                className={`rounded-full px-4 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/15 focus:ring-offset-2 focus:ring-offset-transparent ${
                  isActive("/")
                    ? "bg-white/[0.08] text-white"
                    : "border border-white/[0.1] text-white/90 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                Entrar
              </Link>
            )
          )}
        </div>
      </nav>

      {/* (No extra mobile-only search wrapper; desktop search bar is now visible on mobile as well) */}
    </header>
  );
}
