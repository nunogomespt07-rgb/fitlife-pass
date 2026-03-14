"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useNotifications } from "@/app/context/NotificationsContext";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import { getStoredUser, getStoredUserDisplayName } from "@/lib/storedUser";
import { getAllPartnersWithCategory } from "@/lib/activitiesData";
import { RESTAURANTS } from "@/lib/restaurantsData";

export const MobileSearchOpenContext = createContext<{
  isMobileSearchOpen: boolean;
  setIsMobileSearchOpen: (v: boolean) => void;
}>({ isMobileSearchOpen: false, setIsMobileSearchOpen: () => {} });

export function MobileSearchProvider({ children }: { children: React.ReactNode }) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  return (
    <MobileSearchOpenContext.Provider value={{ isMobileSearchOpen, setIsMobileSearchOpen }}>
      {children}
    </MobileSearchOpenContext.Provider>
  );
}

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
  const { isMobileSearchOpen, setIsMobileSearchOpen } = useContext(MobileSearchOpenContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchPanelRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuPanelRef = useRef<HTMLDivElement | null>(null);

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

  // Desktop search: Escape to close & clear
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchQuery("");
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Mobile search: autofocus input when opened
  useEffect(() => {
    if (!isMobileSearchOpen) return;
    const id = window.setTimeout(() => {
      mobileSearchInputRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(id);
  }, [isMobileSearchOpen]);

  // Lock body scroll while mobile search is open
  useEffect(() => {
    if (!isMobileSearchOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileSearchOpen]);

  // Mobile account menu: close on outside tap
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        mobileMenuPanelRef.current &&
        !mobileMenuPanelRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

  const showSearchResults =
    searchQuery.length > 0 &&
    filteredSearchItems.length > 0;

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

  if (showAuthenticatedUI && isMobileSearchOpen) {
    return (
      <div className="fixed inset-0 z-[140] sm:hidden bg-[rgba(5,10,25,0.985)]">
        <div className="flex h-full flex-col">
          <div className="shrink-0 px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center rounded-full border border-white/[0.08] bg-[rgba(255,255,255,0.04)] px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-white/50"
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
                    ref={mobileSearchInputRef}
                    type="text"
                    inputMode="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar atividades, parceiros ou clubes"
                    className="w-full bg-transparent text-[17px] text-white placeholder:text-white/45 outline-none"
                  />
                  {searchQuery.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/70 transition active:scale-[0.98]"
                      aria-label="Limpar pesquisa"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery("");
                }}
                className="shrink-0 text-[17px] font-medium text-white/88 transition active:opacity-70"
              >
                Cancelar
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-[max(28px,env(safe-area-inset-bottom))] pt-2">
            {searchQuery.trim().length === 0 ? null : filteredSearchItems.length === 0 ? (
              <div className="rounded-[28px] border border-white/[0.08] bg-[rgba(255,255,255,0.03)] px-5 py-5 text-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
                Sem resultados
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSearchItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      router.push(item.href);
                      setIsMobileSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="block w-full rounded-[26px] border border-white/[0.08] bg-[rgba(255,255,255,0.04)] px-5 py-4 text-left shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition active:bg-white/[0.08]"
                  >
                    <div className="text-[17px] font-medium text-white">
                      {item.name}
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      {item.category}
                      {item.city || item.location ? ` · ${item.city || item.location}` : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            <div className="relative hidden sm:flex flex-1 items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 shadow-sm backdrop-blur-md">
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
                }}
                placeholder="Pesquisar parceiros (Lisboa, Yoga, Terra...)"
                className="w-full bg-transparent text-xs text-white/90 placeholder:text-white/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
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
                              setIsMobileSearchOpen(false);
                              setSearchQuery("");
                              mobileSearchInputRef.current?.blur();
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

        {/* Right side – nav links + actions */}
        <div className="mobileHeaderRight ml-auto flex items-center gap-2.5 sm:gap-4">
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
            <>
              {/* Mobile-only header actions: search + bell + avatar */}
              <div className="flex items-center gap-2.5 sm:hidden">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMobileSearchOpen(true);
                  }}
                  className="relative shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 shadow-sm backdrop-blur-md transition hover:bg-white/10"
                  aria-label="Pesquisar"
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
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.65" y1="16.65" x2="21" y2="21" />
                  </svg>
                </button>

                {/* Mobile bell */}
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/notifications")}
                  className="relative shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 shadow-sm backdrop-blur-md transition hover:bg-white/10"
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

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setIsMobileMenuOpen((prev) => !prev);
                  }}
                  className="shrink-0 flex items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.05] p-1.5 text-xs font-semibold text-white/95 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.08] hover:border-white/[0.14] sm:hidden"
                  aria-expanded={isMobileMenuOpen}
                  aria-haspopup="true"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.24] bg-white/[0.14] text-[12px] font-bold text-white"
                    aria-hidden
                  >
                    {avatarLetter}
                  </span>
                </button>
              </div>

              {/* Desktop / tablet actions – existing dropdown, bell, plan badge, avatar */}
              <div className="relative ml-1 sm:ml-2 hidden sm:block" ref={dropdownRef}>
                <div className="flex items-center gap-[10px] sm:gap-4">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard/notifications")}
                    className="notificationButton relative shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 shadow-sm backdrop-blur-md transition hover:bg-white/10"
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
                    className="shrink-0 flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.04] pl-3 pr-3.5 py-1.5 text-xs font-semibold text-white/95 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.12] focus:outline-none focus:ring-2 focus:ring-white/15 focus:ring-offset-2 focus:ring-offset-transparent"
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
            </>
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

      {showAuthenticatedUI && isMobileMenuOpen && (
        <div className="sm:hidden fixed right-4 top-[86px] z-[80] w-[min(300px,calc(100vw-1.5rem))]">
          <div
            ref={mobileMenuPanelRef}
            className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[rgba(6,12,32,0.94)] shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base font-semibold text-white">
                {avatarLetter}
              </div>

              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold leading-5 text-white">
                  {firstName}
                </p>
                <p className="mt-0.5 truncate text-[13px] text-white/55">
                  {user?.email || session?.user?.email || ""}
                </p>
              </div>
            </div>

            <div className="px-2 py-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-[18px] px-3.5 text-[17px] font-medium text-white/92 transition active:bg-white/10 active:scale-[0.99] hover:bg-white/5"
              >
                Conta
              </Link>

              <Link
                href="/dashboard/perfil"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-[18px] px-3.5 text-[17px] font-medium text-white/92 transition active:bg-white/10 active:scale-[0.99] hover:bg-white/5"
              >
                Perfil
              </Link>

              <Link
                href="/dashboard/favoritos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-[18px] px-3.5 text-[17px] font-medium text-white/92 transition active:bg-white/10 active:scale-[0.99] hover:bg-white/5"
              >
                Favoritos
              </Link>

              <Link
                href="/dashboard/pagamentos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-[18px] px-3.5 text-[17px] font-medium text-white/92 transition active:bg-white/10 active:scale-[0.99] hover:bg-white/5"
              >
                Pagamentos
              </Link>

              <Link
                href="/dashboard/convidar"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-[18px] px-3.5 text-[17px] font-medium text-white/92 transition active:bg-white/10 active:scale-[0.99] hover:bg-white/5"
              >
                Convidar amigos
              </Link>

              <Link
                href="/faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center rounded-[18px] px-3.5 text-[17px] font-medium text-white/92 transition active:bg-white/10 active:scale-[0.99] hover:bg-white/5"
              >
                FAQ
              </Link>
            </div>

            <div className="border-t border-white/[0.06] px-2 py-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex min-h-[44px] w-full items-center rounded-[18px] px-3.5 text-left text-[17px] font-medium text-rose-300 transition active:bg-white/10 active:scale-[0.99] hover:bg-white/5"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
