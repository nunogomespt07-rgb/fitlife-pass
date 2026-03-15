"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import GlassCard from "./components/ui/GlassCard";
import SectionHeader from "./components/ui/SectionHeader";
import PremiumAuthCard from "./components/PremiumAuthCard";

const FEATURED_PARTNERS = [
  {
    name: "FitClub Lisboa",
    category: "Ginásio",
    location: "Chiado, Lisboa",
    distance: "750 m",
    credits: "2–4 créditos",
    badge: "Premium",
  },
  {
    name: "Zen Yoga Studio",
    category: "Yoga",
    location: "Príncipe Real, Lisboa",
    distance: "1,2 km",
    credits: "1–3 créditos",
    badge: "Signature",
  },
  {
    name: "Clube Padel Lisboa",
    category: "Padel",
    location: "Monsanto, Lisboa",
    distance: "15 min",
    credits: "3–5 créditos",
    badge: "Popular",
  },
  {
    name: "Aqua Lisboa Club",
    category: "Piscina & Wellness",
    location: "Parque das Nações",
    distance: "20 min",
    credits: "2–4 créditos",
    badge: "Wellness",
  },
];

export default function LandingPage() {
  const partnersRef = useRef<HTMLElement | null>(null);
  const howItWorksRef = useRef<HTMLDivElement | null>(null);
  const gymsRef = useRef<HTMLDivElement | null>(null);
  const [partnersVisible, setPartnersVisible] = useState(false);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const [gymsVisible, setGymsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target === partnersRef.current) setPartnersVisible(true);
          if (entry.target === howItWorksRef.current) setHowItWorksVisible(true);
          if (entry.target === gymsRef.current) setGymsVisible(true);
        }
      },
      { threshold: 0.12 }
    );

    if (partnersRef.current) observer.observe(partnersRef.current);
    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    if (gymsRef.current) observer.observe(gymsRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-bg text-white font-sans">
      {/* ========== HERO – Cinematic scene, athlete integrated ========== */}
      <section className="landing-hero relative min-h-[min(100vh,860px)] sm:min-h-[90vh] w-full overflow-hidden lg:overflow-visible">
        {/* Layered background atmosphere – depth and lighting */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(90,140,255,0.25), transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(60,120,255,0.18), transparent 50%)',
              'linear-gradient(180deg, #070f2b 0%, #0f1e4d 100%)',
            ].join(', '),
          }}
          aria-hidden
        />
        {/* Side vignette + depth */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, #070f2b 0%, transparent 38%, transparent 62%, rgba(15,30,77,0.85) 100%)',
          }}
          aria-hidden
        />
        {/* Bottom atmospheric fade */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #070f2b 0%, transparent 30%, transparent 72%, rgba(7,15,43,0.4) 100%)',
          }}
          aria-hidden
        />

        {/* MOBILE HERO — unchanged. Hidden on desktop. */}
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:hidden">
          <div className="order-1 flex flex-col justify-center pb-0 sm:pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55 sm:text-xs sm:tracking-[0.32em]">FitLife Pass</p>
            <h1 className="hero-title mt-5 font-extrabold text-white sm:mt-6">
              <span className="block">Um só passe.</span>
              <span className="block">Todos os teus</span>
              <span className="block">treinos.</span>
            </h1>
            <p className="landing-hero-desc mt-5 max-w-md text-base leading-[1.7] text-white/85 sm:mt-6 sm:text-[1.0625rem] sm:leading-[1.75]">
              <span className="block">Ginásio, yoga, padel, crossfit</span>
              <span className="block">e estúdios premium numa só experiência.</span>
            </p>
            <p className="mt-4 text-sm font-medium text-white/70 sm:mt-5 sm:text-[0.9375rem]">Uma conta. Vários parceiros. Sem fidelização.</p>
          </div>
          <div className="order-2 mt-6 mb-4 flex justify-center sm:mt-8 sm:mb-6">
            <div className="landing-hero-runner relative w-full max-w-full flex justify-center items-end min-h-[320px] sm:min-h-[420px] pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center" style={{ margin: "-12%" }} aria-hidden>
                <div className="w-[85%] max-w-[520px] aspect-[3/4] rounded-full opacity-95" style={{ background: "radial-gradient(ellipse 70% 90% at 50% 58%, rgba(90,140,255,0.4) 0%, rgba(60,120,255,0.22) 38%, transparent 82%)", filter: "blur(56px)" }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-80" style={{ margin: "-6%" }} aria-hidden>
                <div className="w-[72%] max-w-[440px] h-[58%] rounded-full" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 72%, rgba(147,197,253,0.18) 0%, transparent 58%)", filter: "blur(64px)" }} />
              </div>
              <div className="relative flex justify-center items-end w-full" style={{ filter: "drop-shadow(0 0 88px rgba(90,140,255,0.28))" }}>
                <div className="relative w-full flex justify-center">
                  <Image src="/images/runner-hero.png" alt="Runner" width={1500} height={2000} className="h-[340px] w-auto max-w-[92%] object-contain object-center sm:h-[460px] md:h-[580px]" style={{ maskImage: "linear-gradient(to bottom, black 0%, black 72%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 72%, transparent 100%)" }} priority unoptimized />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]" style={{ background: "linear-gradient(to top, #070f2b 0%, rgba(7,15,43,0.88) 28%, rgba(7,15,43,0.42) 56%, transparent 100%)" }} aria-hidden />
                  <div className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.12]" style={{ background: "radial-gradient(ellipse 80% 90% at 50% 50%, rgba(37,99,235,0.4) 0%, transparent 70%)" }} aria-hidden />
                </div>
              </div>
            </div>
          </div>
          <div className="order-3 relative z-30 flex items-center justify-center mt-0 pt-0 sm:pt-4">
            <div className="hero-float-card w-full max-w-sm rounded-[var(--radius-card)] sm:max-w-[400px]">
              <Suspense fallback={null}><PremiumAuthCard /></Suspense>
            </div>
          </div>
        </div>

        {/* DESKTOP HERO — 1280px, grid 380+280+340, gap 64px. Text hard-constrained. No athlete box. */}
        <div
          className="hidden lg:grid relative z-10 box-border w-full max-w-[1280px] min-h-[min(92vh,920px)] grid-cols-[380px_280px_340px] items-center gap-x-16 px-10 py-20"
          style={{ marginLeft: "auto", marginRight: "auto" }}
        >
          {/* LEFT — Text only. Hard 380px. No overflow into athlete. */}
          <div className="flex w-full max-w-[380px] flex-col justify-center min-w-0 overflow-visible">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">FitLife Pass</p>
            <h1 className="landing-hero-title-desktop mt-6 font-extrabold text-white">
              <span className="block whitespace-nowrap">Um só passe.</span>
              <span className="block whitespace-nowrap">Todos os teus treinos.</span>
            </h1>
            <p className="mt-5 max-w-[360px] text-[1.0625rem] leading-[1.7] text-white/85">Ginásio, yoga, padel, crossfit e estúdios premium numa só experiência.</p>
            <p className="mt-4 text-sm font-medium text-white/70">Uma conta. Vários parceiros. Sem fidelização.</p>
          </div>

          {/* CENTER — Athlete only. Transparent. No visible box. Subtle glow behind image. */}
          <div className="flex w-full max-w-[280px] items-center justify-center min-w-0">
            <div className="relative flex w-full max-w-[260px] items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                <div className="h-[90%] w-[90%] rounded-full opacity-60" style={{ background: "radial-gradient(circle at 50% 50%, rgba(90,140,255,0.2) 0%, transparent 65%)", filter: "blur(32px)" }} />
              </div>
              <div className="relative w-full" style={{ filter: "drop-shadow(0 0 40px rgba(90,140,255,0.12))" }}>
                <div className="w-full" style={{ background: "linear-gradient(to top, #070f2b 0%, rgba(7,15,43,0.88) 28%, transparent 100%)" }}>
                  <Image src="/images/runner-hero.png" alt="Runner" width={1500} height={2000} className="h-auto w-full object-contain object-center" style={{ maskImage: "linear-gradient(to bottom, black 0%, black 72%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 72%, transparent 100%)" }} priority unoptimized />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Auth. max-width 340px, justify-end. */}
          <div className="flex w-full max-w-[340px] justify-end min-w-0">
            <div className="hero-float-card w-full max-w-[340px] rounded-[var(--radius-card)] bg-white/[0.04] border border-white/[0.08] backdrop-blur-[18px] shadow-[0_40px_90px_rgba(0,0,0,0.45)]">
              <Suspense fallback={null}><PremiumAuthCard desktopWider /></Suspense>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 lg:px-10">
        {/* Partner logos */}
        <section
          ref={partnersRef}
          className={`transition-all duration-300 ${
            partnersVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
              Parceiros em destaque
            </p>
            <span className="hidden text-xs font-medium text-white/50 sm:inline">
              +50 espaços em Lisboa e Porto
            </span>
          </div>
          <div className="mt-8 flex gap-5 overflow-x-auto pb-3 -mx-4 px-4 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {FEATURED_PARTNERS.map((p) => (
              <GlassCard
                key={p.name}
                variant="dark"
                padding="sm"
                as="article"
                className="min-w-[260px] sm:min-w-0 hover-lift"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.75),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(129,140,248,0.8),transparent_55%)]">
                    <span className="h-8 w-8 rounded-xl bg-slate-950/80" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                    <p className="mt-0.5 text-[11px] text-white/60">
                      {p.category} · {p.location}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-white/70">
                  <span className="rounded-full bg-white/12 px-2.5 py-1 text-white/85">{p.credits}</span>
                  <span className="text-white/60">{p.distance}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-emerald-400/16 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                    {p.badge}
                  </span>
                  <span className="text-[10px] text-white/55">Reservas flexíveis</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <div
          ref={howItWorksRef}
          className={`transition-all duration-300 ${
            howItWorksVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <SectionHeader
            title="Como Funciona"
            subtitle="Cria conta grátis, recebe créditos e reserva aulas em ginásios e estúdios parceiros. Uma única app para todas as tuas atividades."
            className="mt-24 sm:mt-28"
          />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              step: "Passo 1",
              title: "Cria a tua conta",
              desc: "Em menos de 1 minuto, ficas pronto a reservar.",
            },
            {
              step: "Passo 2",
              title: "Explora espaços premium",
              desc: "Filtra por zona, modalidade e horário ideal para ti.",
            },
            {
              step: "Passo 3",
              title: "Reserva com créditos",
              desc: "Confirma em segundos e aparece na aula — sem fidelização.",
            },
          ].map(({ step, title, desc }) => (
            <GlassCard
              key={step}
              variant="dark"
              padding="lg"
              className="text-left hover-lift"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80">
                  <span className="text-xs font-semibold">{step.replace("Passo ", "")}</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                    {step}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">{desc}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div
          ref={gymsRef}
          className={`transition-all duration-300 ${
            gymsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <SectionHeader
            title="Para Ginásios"
            subtitle="Queres listar as tuas aulas na FitLife Pass? Contacta-nos para parceria e mais visibilidade."
            className="mt-32 sm:mt-40"
          />
          <GlassCard
            variant="dark"
            padding="lg"
            as="section"
            className="mt-12 hover-lift"
          >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
                Para ginásios & estúdios
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Liga o teu espaço à próxima geração de membros
              </h3>
              <p className="mt-2 text-sm text-white/70">
                Recebe novas reservas, aumenta a taxa de ocupação e mantém o controlo total da
                tua grelha de aulas.
              </p>
            </div>
            <div className="mt-2 flex flex-col items-start gap-3 sm:mt-0 sm:items-end">
              <a
                href="mailto:parcerias@fitpass.pt"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(15,23,42,0.5)] transition hover:bg-white/95"
              >
                Falar com a equipa
              </a>
              <p className="text-[11px] text-white/55">
                Parcerias sem exclusividade · Onboarding em poucos dias
              </p>
            </div>
          </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
