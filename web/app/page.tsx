"use client";

import { Suspense } from "react";
import Image from "next/image";
import GlassCard from "./components/ui/GlassCard";
import SectionHeader from "./components/ui/SectionHeader";
import PremiumAuthCard from "./components/PremiumAuthCard";

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
          <div className="order-1 flex flex-col justify-center pb-4 sm:pb-6 lg:max-w-[520px] lg:pr-3 lg:pb-0 xl:max-w-[520px]">
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

          {/* CENTER ZONE: runner – visual anchor between text and card */}
          <div className="order-3 relative flex min-h-[200px] max-h-[260px] items-center justify-center overflow-hidden py-4 sm:min-h-[320px] sm:max-h-[420px] lg:order-2 lg:min-h-[min(92vh,900px)] lg:max-h-none lg:-translate-x-16 lg:justify-start lg:pb-[4%] lg:pt-6 lg:px-0 xl:-translate-x-20">
            <Image
              src="/images/runner-hero.png"
              alt="Runner"
              width={1500}
              height={2000}
              className="pointer-events-none max-h-56 w-auto scale-[1.1] object-contain object-center sm:max-h-[70vh] sm:scale-[1.3] lg:scale-[1.6]"
              priority
              unoptimized
            />
          </div>

          {/* RIGHT ZONE: login card – alinhado com o runner para melhor balanço */}
          <div className="order-2 flex items-center justify-center pt-6 lg:order-3 lg:justify-center lg:pl-0 lg:pt-0">
            <Suspense fallback={null}>
              <PremiumAuthCard />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-10">
        {/* Partner logos */}
        <section className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
            Parceiros
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {["FitClub Lisboa", "Zen Yoga Studio", "Clube Padel Lisboa", "Aqua Lisboa Club"].map((name) => (
              <div
                key={name}
                className="rounded-[28px] border border-white/[0.12] bg-white/[0.04] px-7 py-4 text-sm font-medium text-white/70 backdrop-blur-[48px]"
              >
                {name}
              </div>
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
            { step: "1", title: "Regista-te", desc: "Cria conta em segundos." },
            { step: "2", title: "Escolhe a aula", desc: "Pesquisa por tipo, local e data." },
            { step: "3", title: "Reserva", desc: "Usa créditos e aparece na aula." },
          ].map(({ step, title, desc }) => (
            <GlassCard
              key={step}
              variant="dark"
              padding="lg"
              className="text-center rounded-2xl border border-white/[0.08] bg-white/[0.07] shadow-[0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-[12px] transition-all duration-200 hover:bg-white/[0.09] hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
            >
              <span className="text-3xl font-bold text-white/60">{step}</span>
              <p className="mt-4 font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm text-white/70">{desc}</p>
            </GlassCard>
          ))}
        </div>

        <SectionHeader
          title="Para Ginásios"
          subtitle="Queres listar as tuas aulas na FitLife Pass? Contacta-nos para parceria e mais visibilidade."
          className="mt-32"
        />
        <a
          href="mailto:parcerias@fitpass.pt"
          className="mt-8 inline-block rounded-[28px] border border-white/[0.14] bg-white/[0.06] px-7 py-4 text-sm font-medium text-white transition hover:bg-white/[0.1] backdrop-blur-xl"
        >
          Contactar parcerias
        </a>
      </div>
    </div>
  );
}
