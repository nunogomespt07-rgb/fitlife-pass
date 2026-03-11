"use client";

type GlassCardProps = {
  children: React.ReactNode;
  variant?: "light" | "dark";
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  active?: boolean;
  as?: "div" | "section" | "article";
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
}: GlassCardProps) {
  const base =
    "rounded-[22px] border border-white/[0.14] bg-white/[0.05] backdrop-blur-[20px] transition-all duration-300";
  const variantClass =
    variant === "light"
      ? "bg-white/[0.10]"
      : "bg-slate-950/40";
  const glow =
    "shadow-[0_18px_52px_rgba(15,23,42,0.85)]";
  const motion = [hover && "hover-lift", active && "active-scale"]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={`${base} ${variantClass} ${glow} ${paddingMap[padding]} ${motion} ${className}`}
    >
      {children}
    </Component>
  );
}
