"use client";

import Image from "next/image";

/** Single hero image – Apple Fitness+ style: /public/images/fitpass-hero.jpg */
const HERO_IMAGE = "/images/gym-hero.jpg";

type HeroBackgroundProps = {
  src?: string;
  height?: "short" | "medium" | "tall" | "full" | "compact" | "activities";
  overlay?: "bottom" | "top" | "both" | "right" | "none" | "premium";
  roundedBottom?: boolean;
  rounded?: boolean;
  className?: string;
  children?: React.ReactNode;
  lightStreaks?: boolean;
  objectPosition?: "left" | "center";
  noOverlayContent?: boolean;
  /** When hero is at top of page, add gradient so fixed nav is readable */
  topGradientForNav?: boolean;
};

const heightMap = {
  compact: "h-40 sm:h-48 md:h-[14rem]",
  activities: "h-[320px] sm:h-[340px] md:h-[360px]",
  short: "h-56 sm:h-64 md:h-72",
  medium: "h-72 sm:h-96 md:h-[28rem]",
  tall: "h-[28rem] sm:h-[32rem] md:h-[36rem]",
  full: "min-h-screen",
};

/* Overlays – premium = Apple Fitness+ / Nike cinematic blue */
const overlayMap = {
  premium:
    "bg-gradient-to-t from-[#07122b]/70 via-[#0b1f52]/30 to-transparent",
  bottom:
    "bg-gradient-to-t from-[#060d18] via-[#060d18]/88 to-transparent",
  top: "bg-gradient-to-b from-[#060d18]/92 via-transparent to-transparent",
  both: "bg-gradient-to-b from-[#060d18]/80 via-[#0f1c2e]/50 to-[#060d18]/96",
  right:
    "bg-gradient-to-r from-transparent via-[#060d18]/60 to-[#060d18]/96",
  none: "",
};

export default function HeroBackground({
  src = HERO_IMAGE,
  height = "medium",
  overlay = "bottom",
  roundedBottom = false,
  rounded = false,
  className = "",
  children,
  lightStreaks = true,
  objectPosition = "center",
  noOverlayContent = false,
  topGradientForNav = false,
}: HeroBackgroundProps) {
  const showContent = children && !noOverlayContent;
  const objPos = objectPosition === "left" ? "object-left" : "object-center";

  return (
    <div
      className={`relative overflow-hidden ${roundedBottom ? "rounded-b-[32px]" : ""} ${rounded ? "rounded-3xl" : ""} ${className} ${rounded ? "shadow-xl shadow-black/20" : ""}`}
    >
      <div className={`relative w-full overflow-hidden ${heightMap[height]}`}>
        <Image
          src={src}
          alt="Premium gym training"
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* Apple-style overlay – when not using overlay="premium", use default blue tint */}
      {overlay !== "premium" && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#07122b]/60 via-[#0b1f52]/20 to-transparent pointer-events-none z-10"
          aria-hidden
        />
      )}
      {overlay !== "none" && overlay !== "premium" && (
        <div
          className={`absolute inset-0 z-10 ${overlayMap[overlay]}`}
          aria-hidden
        />
      )}
      {overlay === "premium" && (
        <div
          className="absolute inset-0 z-10 bg-gradient-to-t from-[#07122b]/70 via-[#0b1f52]/30 to-transparent pointer-events-none"
          aria-hidden
        />
      )}
      {/* Top gradient – nav area readable */}
      {topGradientForNav && (
        <div
          className="absolute left-0 right-0 top-0 z-10 h-20 bg-gradient-to-b from-[#060d18]/90 to-transparent pointer-events-none"
          aria-hidden
        />
      )}
      {/* Very subtle bottom blend only – elegant, not noisy */}
      {lightStreaks && (
        <div
          className="pointer-events-none absolute inset-0 z-[11]"
          aria-hidden
        >
          <div
            className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-[#060d18]/40 to-transparent"
            aria-hidden
          />
        </div>
      )}
      {showContent && (
        <div className="absolute inset-0 z-20 flex flex-col justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
