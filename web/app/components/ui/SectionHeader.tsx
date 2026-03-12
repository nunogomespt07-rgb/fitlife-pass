"use client";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
  /** "app" = internal app section title (24–26px, 600) */
  variant?: "default" | "app";
};

export default function SectionHeader({
  title,
  subtitle,
  className = "",
  variant = "default",
}: SectionHeaderProps) {
  return (
    <header className={className}>
      <h2
        className={
          variant === "app"
            ? "app-section-title text-white tracking-tight"
            : "font-bold tracking-tight text-white"
        }
        style={
          variant === "default"
            ? { fontSize: "var(--text-section)", letterSpacing: "-0.02em", lineHeight: 1.2 }
            : undefined
        }
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/72 sm:mt-5 sm:text-base">
          {subtitle}
        </p>
      )}
    </header>
  );
}
