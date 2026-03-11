"use client";

import { useCallback } from "react";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onToggle: () => void;
  className?: string;
  ariaLabel?: string;
};

export default function FavoriteButton({
  isFavorite,
  onToggle,
  className = "",
  ariaLabel,
}: FavoriteButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    },
    [onToggle]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent ${
        isFavorite
          ? "border-red-400/50 bg-red-500/25 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)] hover:bg-red-500/35 hover:shadow-[0_0_16px_rgba(239,68,68,0.3)]"
          : "border-white/20 bg-white/10 text-white/70 hover:bg-white/15 hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]"
      } ${className}`}
      aria-label={ariaLabel ?? (isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos")}
    >
      <HeartIcon filled={isFavorite} />
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="h-3.5 w-3.5 transition-transform duration-150 active:scale-90"
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
