"use client";

type SkeletonProps = {
  className?: string;
  /** "shimmer" = subtle shimmer animation */
  variant?: "shimmer" | "static";
};

export default function Skeleton({ className = "", variant = "shimmer" }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl bg-white/10 ${variant === "shimmer" ? "skeleton-shimmer" : ""} ${className}`}
      aria-hidden
    />
  );
}
