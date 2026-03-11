"use client";

import { Suspense } from "react";
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
  return (
    <div className="page-bg text-white font-sans">
      {/* ========== PREMIUM HERO – One continuous composition ========== */}
      <section className="relative min-h-[80vh] w-full overflow-hidden">
        {/* Background – directional energy: left darker → runner zone glow → right softer */}
        <div className="absolute inset-0 bg-[#0a0f1e]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070c18] via-[#0f172a] to-[#0f172a]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-[#1e1b4b]/60 to-slate-900/85" aria-hidden />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: 'linear-gradient(90deg, rgba(7,12,24,0.4) 0%, transparent 35%, transparent 65%, rgba(15,23,42,0.25) 100%)',
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_50%,rgba(59,130,246,0.06),transparent_50%)]" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_60%,rgba(99,102,241,0.04),transparent_40%)]" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_55%,rgba(0,0,0,0.12)_100%)]" aria-hidden />

        {/* Motion trail – soft energy behind runner, dissolves into background */}
        <div
          className="pointer-events-none absolute left-[28%] top-1/2 h-[1px] w-[24%] -translate-y-1/2 opacity-[0.06] blur-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 30%, rgba(34,211,238,0.35) 70%, transparent 100%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[30%] top-[48%] h-[1px] w-[20%] -translate-y-1/2 opacity-[0.05] blur-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 40%, transparent 100%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[26%] top-[52%] h-[1px] w-[22%] -translate-y-1/2 opacity-[0.04] blur-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.35) 50%, transparent 100%)',
          }}
          aria-hidden
        />

        {/* Energy from text – originates at text edge, flows into runner glow, fades before card */}
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, transparent 26%, rgba(59,130,246,0.05) 32%, rgba(59,130,246,0.09) 48%, rgba(34,211,238,0.03) 62%, transparent 74%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[28%] top-1/2 h-[72%] w-[48%] -translate-y-1/2 blur-[56px] opacity-90"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at 0% 50%, rgba(59,130,246,0.07), transparent 60%)',
          }}
          aria-hidden
        />

        {/* Runner glow – centered on athlete, extends toward card, fades before touching */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 blur-[68px]"
          style={{
            background: 'radial-gradient(ellipse 70% 82% at 55% 50%, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.04) 25%, rgba(34,211,238,0.025) 48%, transparent 78%)',
          }}
          aria-hidden
        />

        {/* Soft background light glow behind athlete */}
        <div
          className="pointer-events-none absolute inset-0 blur-[42px] opacity-80"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, rgba(80,150,255,0.24), transparent 60%)",
          }}
          aria-hidden
        />

        {/* Content – tight 3 zones: TEXT → RUNNER → LOGIN – premium SaaS flow */}
        <div className="relative z-10 mx-auto grid min-h-[70vh] max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:min-h-[min(92vh,920px)] lg:grid-cols-[minmax(0,480px)_2.2fr_minmax(0,380px)] lg:items-center lg:gap-6 lg:px-8 lg:py-10 xl:gap-8 xl:px-10">
          {/* LEFT ZONE: headline + supporting text – editorial max-width */}
          <div className="order-1 flex flex-col justify-center pb-1 sm:pb-4 lg:max-w-[520px] lg:pr-3 lg:pb-0 xl:max-w-[520px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-white/55">
              FitLife Pass
            </p>
            <h1 className="mt-6 text-[2.1rem] font-bold leading-[1.18] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-[3.25rem] xl:leading-[1.16]">
              <span className="block">Um só passe.</span>
              <span className="block">Todos os teus</span>
              <span className="block">treinos.</span>
            </h1>
            <p className="mt-4 max-w-md text-[0.95rem] leading-[1.7] text-white/88 sm:text-base">
              <span className="block">Ginásio, yoga, padel, crossfit</span>
              <span className="block">e estúdios premium</span>
              <span className="block">numa só experiência.</span>
            </p>
            <p className="mt-6 text-sm font-medium text-white/55">
              Uma conta. Vários parceiros. Sem fidelização.
            </p>
          </div>

          {/* CENTER ZONE: runner – visual anchor between text and card (mobile: entre texto e card) */}
          <div className="order-2 relative z-10 mt-4 -mb-2 flex h-[258px] items-center justify-center sm:mt-7 sm:-mb-2 sm:h-[310px] lg:order-2 lg:z-auto lg:mt-0 lg:mb-0 lg:h-auto lg:min-h-[min(92vh,900px)] lg:-translate-x-16 lg:justify-start lg:pb-[4%] lg:pt-6 lg:px-0 xl:-translate-x-20">
            <div
              className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, rgba(59,130,246,0.45), transparent 65%)",
              }}
              aria-hidden
            />
            <Image
              src="/images/runner-hero.png"
              alt="Runner"
              width={1500}
              height={2000}
              className="pointer-events-none max-h-56 w-auto scale-[1.05] object-contain object-center drop-shadow-[0_0_40px_rgba(59,130,246,0.35)] sm:max-h-[70vh] sm:scale-[1.25] lg:scale-[1.6]"
              priority
              unoptimized
            />
          </div>

          {/* RIGHT ZONE: login card – alinhado com o runner para melhor balanço */}
          <div className="order-3 relative z-20 flex items-center justify-center -mt-2 pt-0 sm:z-auto sm:mt-0 sm:pt-3 lg:order-3 lg:justify-center lg:pl-0 lg:pt-0">
            <Suspense fallback={null}>
              <PremiumAuthCard />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-10">
        {/* Partner logos */}
        <section>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
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
                className="min-w-[240px] rounded-2xl border-white/18 bg-white/[0.05] shadow-[0_16px_40px_rgba(15,23,42,0.7)] sm:min-w-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[conic-gradient(from_140deg_at_30%_20%,#38bdf8,#6366f1,#22c55e,#38bdf8)]">
                    <span className="h-8 w-8 rounded-full bg-slate-950/80" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                    <p className="mt-0.5 text-[11px] text-white/60">
                      {p.category} · {p.location}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-white/70">
                  <span className="rounded-full bg-white/10 px-2 py-1">{p.credits}</span>
                  <span>{p.distance}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                    {p.badge}
                  </span>
                  <span className="text-[10px] text-white/55">Reservas flexíveis</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <SectionHeader
          title="Como Funciona"
          subtitle="Cria conta grátis, recebe créditos e reserva aulas em ginásios e estúdios parceiros. Uma única app para todas as tuas atividades."
          className="mt-20"
        />
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
              className="rounded-2xl border border-white/[0.09] bg-white/[0.05] text-left shadow-[0_14px_36px_rgba(15,23,42,0.75)] backdrop-blur-[14px] transition-all duration-200 hover:bg-white/[0.08] hover:shadow-[0_18px_48px_rgba(15,23,42,0.85)]"
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

        <SectionHeader
          title="Para Ginásios"
          subtitle="Queres listar as tuas aulas na FitLife Pass? Contacta-nos para parceria e mais visibilidade."
          className="mt-32"
        />
        <GlassCard
          variant="dark"
          padding="lg"
          as="section"
          className="mt-10 rounded-3xl border-white/20 bg-white/[0.06] text-left shadow-[0_20px_60px_rgba(15,23,42,0.8)]"
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
  );
}
