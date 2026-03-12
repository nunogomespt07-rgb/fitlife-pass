"use client";

type GlassCardProps = {
  children: React.ReactNode;
  variant?: "light" | "dark" | "app";
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  active?: boolean;
  as?: "div" | "section" | "article";
  /** Internal app: micro highlight line on top */
  activityStyle?: boolean;
};

const paddingMap = {
  none: "",
  sm: "p-5 sm:p-6",
  md: "p-6 sm:p-8",
  lg: "p-6 sm:p-9",
};

export default function GlassCard({
  children,
  variant = "dark",
  className = "",
  padding = "md",
  hover = false,
  active = false,
  as: Component = "div",
  activityStyle = false,
}: GlassCardProps) {
  const base =
    "rounded-2xl border backdrop-blur-[32px] transition-all duration-[180ms] ease-out";
  const variantClass =
    variant === "light"
      ? "bg-white/[0.10] border-[var(--ref-glass-border-strong)] shadow-[var(--shadow-glass)]"
      : variant === "app"
        ? "app-card border-white/[0.06]"
        : "bg-[var(--ref-glass-surface)] border-[var(--ref-glass-border-strong)] shadow-[var(--shadow-glass)]";
  const motion = [hover && "hover:translate-y-[-2px]", active && "active:scale-[0.98]"]
    .filter(Boolean)
    .join(" ");
  const activityLine = activityStyle ? "app-card-activity relative" : "";

  return (
    <Component
      className={`${base} ${variantClass} ${paddingMap[padding]} ${motion} ${activityLine} ${className}`}
    >
      {children}
    </Component>
  );
}
