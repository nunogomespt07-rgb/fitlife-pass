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
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  const variantClass =
    variant === "primary"
      ? "bg-[linear-gradient(135deg,#3B82F6,#2563EB)] text-white shadow-[0_10px_30px_rgba(59,130,246,0.45)] hover:shadow-[0_14px_40px_rgba(59,130,246,0.55)] hover:translate-y-[-2px]"
      : "border border-white/[0.22] bg-white/[0.06] text-white hover:bg-white/[0.10]";

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
