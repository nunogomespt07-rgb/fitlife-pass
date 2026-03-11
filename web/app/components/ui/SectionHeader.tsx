"use client";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export default function SectionHeader({
  title,
  subtitle,
  className = "",
}: SectionHeaderProps) {
  return (
    <header className={className}>
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl md:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
          {subtitle}
        </p>
      )}
    </header>
  );
}
