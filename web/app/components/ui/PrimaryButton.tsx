"use client";

type PrimaryButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  /** When loading, show this instead of children. Default: "A processar…" */
  loadingLabel?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  /** "primary" = white bg, "secondary" = glass outline */
  variant?: "primary" | "secondary";
};

export default function PrimaryButton({
  children,
  type = "button",
  disabled = false,
  loading = false,
  loadingLabel,
  onClick,
  href,
  className = "",
  variant = "primary",
}: PrimaryButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  const variantClass =
    variant === "primary"
      ? "bg-[linear-gradient(135deg,#3B82F6_0%,#2563EB_100%)] text-white shadow-[var(--shadow-cta)] hover:shadow-[0_6px_28px_rgba(59,130,246,0.5),0_1px_0_rgba(255,255,255,0.12)_inset] hover:translate-y-[-2px]"
      : "border border-white/[0.2] bg-white/[0.06] text-white hover:bg-white/[0.10] hover:border-white/30";

  const content = loading ? (
    <>
      <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      {loadingLabel ?? "A processar…"}
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <a
        href={href}
        className={`${base} ${variantClass} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variantClass} ${className}`}
    >
      {content}
    </button>
  );
}
