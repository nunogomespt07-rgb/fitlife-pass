
import { CATEGORY_UI_DATA } from "@/lib/activitiesData";
import GlassCard from "../components/ui/GlassCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import SectionHeader from "../components/ui/SectionHeader";
import HeroBackground from "../components/ui/HeroBackground";

export default function ActivitiesPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#070b14] via-[#0f172a] to-[#2563eb] pb-24">
      <HeroBackground
        overlay="premium"
        height="activities"
        className="w-full rounded-b-3xl"
      >
        <div className="flex h-full flex-col items-center justify-center py-12">
          <h1 className="mb-2 text-4xl font-extrabold text-white drop-shadow-lg md:text-5xl">
            Atividades
          </h1>
          <p className="mb-4 text-center text-lg font-medium text-white/80">
            Explora as melhores experiências fitness premium.
          </p>
        </div>
      </HeroBackground>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Explorar por categoria"
          subtitle="Descobre atividades por modalidade e encontra parceiros premium."
          variant="app"
          className="mt-12 mb-8"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.values(CATEGORY_UI_DATA).map((cat) => (
            <GlassCard
              key={cat.slug}
              className="min-h-[320px] flex flex-col items-center justify-between bg-white/10 border border-white/20 rounded-3xl backdrop-blur-xl p-8 shadow-[0_8px_32px_0_rgba(59,130,246,0.18)] transition-all duration-300 hover:bg-white/15 hover:shadow-blue-500/30"
            >
              <div className="flex flex-col items-center w-full">
                <div className="bg-white/10 border border-white/20 rounded-full p-3 mb-4">
                  <span className="text-3xl">{cat.icon}</span>
                </div>
                <h3 className="text-white font-semibold text-lg text-center mb-2">{cat.label}</h3>
                <p className="text-white/70 text-sm text-center mb-4">{cat.shortDescription}</p>
                <div className="flex items-center justify-center gap-2 text-white/60 text-xs mb-2">
                  <span>{cat.cityLabel}</span>
                  <span>•</span>
                  <span>{cat.sessionsLabel}</span>
                </div>
                <div className="text-white/80 text-xs font-medium mb-6">{cat.creditsLabel}</div>
              </div>
              <PrimaryButton
                href={`/activities/categorias/${cat.slug}`}
                variant="outline"
                className="mt-auto border border-white/30 rounded-full px-6 py-2 text-white text-sm font-semibold transition hover:bg-white/10 outline-none focus:ring-2 focus:ring-white/40"
              >
                {cat.ctaLabel}
              </PrimaryButton>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}