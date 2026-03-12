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
      <section className="relative min-h-[min(100vh,860px)] sm:min-h-[90vh] w-full overflow-hidden">
        {/* Layer 1: Deep navy base */}
        <div className="absolute inset-0 bg-[#050a12]" aria-hidden />
        {/* Layer 2: Gradient depth */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(165deg, #050a12 0%, #0a0f1c 25%, #0f172a 50%, #0c1222 100%)',
          }}
          aria-hidden
        />
        {/* Layer 3: Radial key light – behind athlete position (center-right) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 90% 100% at 55% 55%, rgba(59,130,246,0.22) 0%, rgba(37,99,235,0.1) 35%, transparent 60%)',
          }}
          aria-hidden
        />
        {/* Layer 4: Secondary atmospheric glow – top-left fill */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 15% 30%, rgba(96,165,250,0.08) 0%, transparent 50%)',
          }}
          aria-hidden
        />
        {/* Layer 5: Side vignette + depth */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, #050a12 0%, transparent 35%, transparent 65%, rgba(10,15,28,0.9) 100%)',
          }}
          aria-hidden
        />
        {/* Layer 6: Bottom atmospheric fade (ground shadow) */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #050a12 0%, transparent 25%, transparent 70%, rgba(5,10,18,0.4) 100%)',
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 pt-8 pb-8 sm:px-6 sm:pt-12 sm:pb-10 lg:min-h-[min(92vh,920px)] lg:grid-cols-[minmax(0,480px)_1.4fr_minmax(0,400px)] lg:items-center lg:gap-10 lg:px-8 lg:py-14 xl:gap-12 xl:px-10">
          {/* LEFT: headline – bolder, more presence */}
          <div className="order-1 flex flex-col justify-center pb-0 sm:pb-4 lg:max-w-[520px] lg:pr-4 lg:pb-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55 sm:text-xs sm:tracking-[0.32em]">
              FitLife Pass
            </p>
            <h1 className="hero-title mt-5 font-extrabold text-white sm:mt-6 lg:mt-8">
              <span className="block">Um só passe.</span>
              <span className="block">Todos os teus</span>
              <span className="block">treinos.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-[1.7] text-white/85 sm:mt-6 sm:text-[1.0625rem] sm:leading-[1.75] lg:mt-8">
              <span className="block">Ginásio, yoga, padel, crossfit</span>
              <span className="block">e estúdios premium numa só experiência.</span>
            </p>
            <p className="mt-4 text-sm font-medium text-white/70 sm:mt-5 sm:text-[0.9375rem]">
              Uma conta. Vários parceiros. Sem fidelização.
            </p>
          </div>

          {/* CENTER: athlete scene – integrated into environment */}
          <div className="order-2 mt-6 mb-4 flex justify-center sm:mt-8 sm:mb-6 lg:order-2 lg:mt-0 lg:mb-0 lg:flex lg:min-h-0 lg:items-center lg:justify-center lg:px-2">
            <div className="relative w-full max-w-full flex justify-center items-end lg:items-center min-h-[320px] sm:min-h-[420px] lg:min-h-0 pointer-events-none">
              {/* Energy glow – soft blur behind athlete */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ margin: '-10%' }}
                aria-hidden
              >
                <div
                  className="w-[80%] max-w-[500px] aspect-[3/4] rounded-full opacity-90"
                  style={{
                    background: 'radial-gradient(ellipse 70% 90% at 50% 60%, rgba(96,165,250,0.35) 0%, rgba(59,130,246,0.18) 40%, rgba(37,99,235,0.06) 65%, transparent 85%)',
                    filter: 'blur(50px)',
                  }}
                />
              </div>
              {/* Mist / soft particles – second blur layer */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-70"
                style={{ margin: '-5%' }}
                aria-hidden
              >
                <div
                  className="w-[70%] max-w-[420px] h-[60%] rounded-full"
                  style={{
                    background: 'radial-gradient(ellipse 80% 70% at 50% 70%, rgba(147,197,253,0.12) 0%, transparent 60%)',
                    filter: 'blur(60px)',
                  }}
                />
              </div>
              {/* Athlete container – gradient fade + color blend */}
              <div className="relative flex justify-center items-end w-full" style={{ filter: 'drop-shadow(0 0 80px rgba(59,130,246,0.2))' }}>
                <div className="relative w-full flex justify-center">
                  <Image
                    src="/images/runner-hero.png"
                    alt="Runner"
                    width={1500}
                    height={2000}
                    className="h-[320px] w-auto max-w-[92%] object-contain object-center sm:h-[440px] md:h-[560px] lg:h-[82vh] lg:max-h-[820px] lg:max-w-[95%] scale-[1.02]"
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, transparent 100%)',
                    }}
                    priority
                    unoptimized
                  />
                  {/* Bottom gradient fade – blends feet into ground */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%]"
                    style={{
                      background: 'linear-gradient(to top, #050a12 0%, rgba(5,10,18,0.85) 25%, rgba(5,10,18,0.4) 55%, transparent 100%)',
                    }}
                    aria-hidden
                  />
                  {/* Subtle color blend overlay – ties figure to background */}
                  <div
                    className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.12]"
                    style={{
                      background: 'radial-gradient(ellipse 80% 90% at 50% 50%, rgba(37,99,235,0.4) 0%, transparent 70%)',
                    }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: auth card – floats above scene */}
          <div className="order-3 relative z-30 flex items-center justify-center mt-0 pt-0 sm:pt-4 lg:order-3 lg:mt-0 lg:pt-0 lg:justify-center lg:pl-0">
            <div className="hero-float-card rounded-[var(--radius-card)]">
              <Suspense fallback={null}>
                <PremiumAuthCard />
              </Suspense>
            </div>
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
