import Link from "next/link";
import GlassCard from "./GlassCard";

type QuickAccessCardProps = {
  href: string;
  title: string;
  description: string;
};

export default function QuickAccessCard({
  href,
  title,
  description,
}: QuickAccessCardProps) {
  return (
    <Link href={href} className="block h-full">
      <GlassCard
        variant="dark"
        padding="lg"
        hover
        className="h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.75)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10"
      >
        <p className="text-xl font-semibold text-white sm:text-[20px]">{title}</p>
        <p className="mt-2 text-xs text-white/75">{description}</p>
        <span className="mt-4 inline-flex items-center text-xs font-medium text-blue-100 underline-offset-2 hover:underline">
          Abrir {title.toLowerCase()} →
        </span>
      </GlassCard>
    </Link>
  );
}

