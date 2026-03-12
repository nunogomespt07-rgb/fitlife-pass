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
      <h2 className="font-bold tracking-tight text-white" style={{ fontSize: 'var(--text-section)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/72 sm:mt-5">
          {subtitle}
        </p>
      )}
    </header>
  );
}
