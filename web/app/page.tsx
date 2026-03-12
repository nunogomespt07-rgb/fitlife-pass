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
      {/* ========== PREMIUM HERO – Mobile-first, tighter composition ========== */}
      <section className="relative min-h-[min(100vh,720px)] sm:min-h-[80vh] w-full overflow-hidden">
        {/* Background – refined gradient, less layers for cleaner premium feel */}
        <div className="absolute inset-0 bg-[#0a0f1e]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-br from-[#070c18] via-[#0f172a] to-[#0f172a]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-[#1e1b4b]/40 to-slate-900/80" aria-hidden />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: 'linear-gradient(90deg, rgba(7,12,24,0.5) 0%, transparent 38%, transparent 62%, rgba(15,23,42,0.2) 100%)',
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_35%,rgba(59,130,246,0.08),transparent_50%)]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" aria-hidden />

        {/* Content – mobile: compact TEXT → RUNNER → CARD with intentional spacing */}
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8 lg:min-h-[min(92vh,920px)] lg:grid-cols-[minmax(0,480px)_1.4fr_minmax(0,380px)] lg:items-center lg:gap-8 lg:px-8 lg:py-10 lg:pt-10 xl:gap-10 xl:px-10">
          {/* LEFT: headline + supporting – tighter on mobile */}
          <div className="order-1 flex flex-col justify-center pb-0 sm:pb-2 lg:max-w-[520px] lg:pr-3 lg:pb-0 xl:max-w-[520px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/50 sm:text-[11px] sm:tracking-[0.36em] sm:text-white/55">
              FitLife Pass
            </p>
            <h1 className="mt-3 text-[1.75rem] font-bold leading-[1.15] tracking-tight text-white sm:mt-5 sm:text-[2.1rem] sm:leading-[1.12] lg:text-5xl xl:text-[3.25rem] xl:leading-[1.1]">
              <span className="block">Um só passe.</span>
              <span className="block">Todos os teus</span>
              <span className="block">treinos.</span>
            </h1>
            <p className="mt-2 max-w-md text-[0.875rem] leading-[1.65] text-white/75 sm:mt-3 sm:text-[0.95rem] sm:leading-[1.7] sm:text-white/80">
              <span className="block">Ginásio, yoga, padel, crossfit</span>
              <span className="block">e estúdios premium numa só experiência.</span>
            </p>
            <p className="mt-3 text-[12px] font-medium text-white/60 sm:mt-5 sm:text-[13px] sm:text-white/70">
              Uma conta. Vários parceiros. Sem fidelização.
            </p>
          </div>

          {/* CENTER: runner – smaller on mobile, better balance */}
          <div className="order-2 mt-2 mb-2 flex justify-center sm:mt-4 sm:mb-3 lg:order-2 lg:mt-0 lg:mb-0 lg:flex lg:min-h-0 lg:items-center lg:justify-center lg:px-2">
            <div className="relative flex w-full max-w-full justify-center pointer-events-none lg:max-w-full">
              <div
                className="pointer-events-none absolute inset-[-8%] -z-10 blur-2xl opacity-90 sm:blur-3xl lg:blur-[80px]"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(96,165,250,0.35) 0%, rgba(37,99,235,0.18) 40%, rgba(15,23,42,0) 70%)",
                }}
                aria-hidden
              />
              <Image
                src="/images/runner-hero.png"
                alt="Runner"
                width={1500}
                height={2000}
                className="h-[280px] w-auto max-w-[85%] object-contain object-center drop-shadow-[0_0_48px_rgba(59,130,246,0.28)] sm:h-[380px] sm:max-w-[90%] md:h-[500px] md:max-w-[96%] md:drop-shadow-[0_0_72px_rgba(59,130,246,0.34)] lg:h-[820px] lg:max-h-[820px] lg:max-w-full"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* RIGHT: auth card – direct adjacency on mobile */}
          <div className="order-3 relative z-20 flex items-center justify-center mt-0 pt-0 sm:pt-2 lg:order-3 lg:mt-0 lg:pt-0 lg:justify-center lg:pl-0">
            <Suspense fallback={null}>
              <PremiumAuthCard />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-10">
        {/* Partner logos */}
        <section
          ref={partnersRef}
          className={`transition-all duration-300 ${
            partnersVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/60">
              Parceiros em destaque
            </p>
            <span className="hidden text-[11px] font-medium text-white/50 sm:inline">
              +50 espaços em Lisboa e Porto
            </span>
          </div>
          {/* Mobile: carrossel horizontal · Desktop: grelha */}
          <div className="mt-6 flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mt-8 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {FEATURED_PARTNERS.map((p) => (
              <GlassCard
                key={p.name}
                variant="dark"
                padding="sm"
                as="article"
                className="min-w-[240px] rounded-[20px] border-white/18 bg-white/[0.04] shadow-[0_16px_44px_rgba(15,23,42,0.78)] sm:min-w-0 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(15,23,42,0.9)]"
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
            className="mt-20"
          />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              className="rounded-[22px] border border-white/[0.12] bg-white/[0.04] text-left shadow-[0_16px_48px_rgba(15,23,42,0.82)] backdrop-blur-[20px] transition-all duration-200 hover:bg-white/[0.07] hover:shadow-[0_20px_56px_rgba(15,23,42,0.9)]"
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
            className="mt-32"
          />
          <GlassCard
            variant="dark"
            padding="lg"
            as="section"
            className="mt-10 rounded-3xl border-white/20 bg-white/[0.06] text-left shadow-[0_22px_64px_rgba(15,23,42,0.9)]"
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
