"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileDashboardNav() {
  const pathname = usePathname();

  const isDashboardArea =
    pathname.startsWith("/dashboard") || pathname.startsWith("/activities");

  const isActive = (target: "home" | "activities" | "reservas" | "checkin" | "perfil") => {
    if (target === "home") return pathname === "/dashboard";
    if (target === "activities")
      return pathname.startsWith("/activities") || pathname.startsWith("/dashboard/atividades");
    if (target === "reservas")
      return pathname.startsWith("/dashboard/reservas");
    if (target === "checkin")
      return pathname.startsWith("/dashboard/qr-codes") || pathname.startsWith("/dashboard/checkin");
    if (target === "perfil")
      return pathname.startsWith("/dashboard/perfil");
    return false;
  };

  if (!isDashboardArea) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center md:hidden">
      <nav className="pointer-events-auto mb-3 w-full max-w-md px-4">
        <div
          className="mx-auto flex items-center justify-between rounded-2xl border border-white/10 bg-[rgba(10,20,40,0.8)] px-5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[rgba(10,20,40,0.8)]"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
        >
          {/* Home */}
          <Link
            href="/dashboard"
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all ${
              isActive("home")
                ? "text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)] bg-white/10"
                : "text-white/60"
            }`}
            style={isActive("home") ? { textShadow: "0 0 10px rgba(120,160,255,0.6)" } : undefined}
          >
            <svg
              className={`h-5 w-5 ${isActive("home") ? "text-white" : "text-white/65"}`}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                d="M4 10.5 12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Home</span>
          </Link>

          {/* Atividades */}
          <Link
            href="/activities"
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all ${
              isActive("activities")
                ? "text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)] bg-white/10"
                : "text-white/60"
            }`}
            style={
              isActive("activities")
                ? { textShadow: "0 0 10px rgba(120,160,255,0.6)" }
                : undefined
            }
          >
            <svg
              className={`h-5 w-5 ${isActive("activities") ? "text-white" : "text-white/65"}`}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                d="M5 20h2l2.5-7 3 5 2-3 4.5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="6"
                cy="6"
                r="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
            <span>Atividades</span>
          </Link>

          {/* Reservas */}
          <Link
            href="/dashboard/reservas"
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all ${
              isActive("reservas")
                ? "text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)] bg-white/10"
                : "text-white/60"
            }`}
            style={
              isActive("reservas")
                ? { textShadow: "0 0 10px rgba(120,160,255,0.6)" }
                : undefined
            }
          >
            <svg
              className={`h-5 w-5 ${isActive("reservas") ? "text-white" : "text-white/65"}`}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <rect
                x="3.5"
                y="4.5"
                width="17"
                height="16"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8 3.5v3M16 3.5v3M4 9.5h16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>Reservas</span>
          </Link>

          {/* Check-in */}
          <Link
            href="/dashboard/qr-codes"
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all ${
              isActive("checkin")
                ? "text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)] bg-white/10"
                : "text-white/60"
            }`}
            style={
              isActive("checkin")
                ? { textShadow: "0 0 10px rgba(120,160,255,0.6)" }
                : undefined
            }
          >
            <svg
              className={`h-5 w-5 ${isActive("checkin") ? "text-white" : "text-white/65"}`}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <rect
                x="4"
                y="4"
                width="6"
                height="6"
                rx="1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <rect
                x="14"
                y="4"
                width="6"
                height="6"
                rx="1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <rect
                x="4"
                y="14"
                width="6"
                height="6"
                rx="1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M14 14h2m-2 4h4m0-4h2m-4 0v-2m0 6v2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>Check-in</span>
          </Link>

          {/* Perfil */}
          <Link
            href="/dashboard/perfil"
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all ${
              isActive("perfil")
                ? "text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)] bg-white/10"
                : "text-white/60"
            }`}
            style={
              isActive("perfil")
                ? { textShadow: "0 0 10px rgba(120,160,255,0.6)" }
                : undefined
            }
          >
            <svg
              className={`h-5 w-5 ${isActive("perfil") ? "text-white" : "text-white/65"}`}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                cx="12"
                cy="8"
                r="3.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M6 18.5c0-2.5 2.2-4.5 6-4.5s6 2 6 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
