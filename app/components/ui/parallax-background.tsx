"use client";

/**
 * ParallaxBackground — Multi-Layer CSS Positioning Parallax System
 *
 * Implements layered parallax for the landing page background using position: fixed
 * and position: absolute layers moving at distinct, visibly perceptible rates.
 * Hosts a single shared Binary Orbits particle galaxy continuously across all sections,
 * ensures foreground text and buttons remain stable, avoids horizontal overflow,
 * supports full-page scroll, and respects prefers-reduced-motion.
 */

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { BinaryOrbits } from "@/app/components/ui/binary-orbits";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

interface ParallaxBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function ParallaxBackground({ className, children }: ParallaxBackgroundProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });

    if (prefersReducedMotion) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  // Motion scaling: scaled down on mobile/touch screens for battery & 60fps smoothness
  const motionScale = prefersReducedMotion ? 0 : isMobile ? 0.35 : 1.0;

  // Layer 1: Subtle grid offset (seamless looping modulus grid)
  const gridOffset = prefersReducedMotion ? 0 : ((scrollY * 0.08 * motionScale) % 56);

  // Layer 2: Upper sky / hero nebula glow (rate: 0.22)
  const upperSkyOffset = prefersReducedMotion ? 0 : scrollY * 0.22 * motionScale;

  // Layer 3: Mid-page horizon blush aura (rate: 0.14)
  const midHorizonOffset = prefersReducedMotion ? 0 : scrollY * 0.14 * motionScale;

  // Layer 4: Lower section deep burgundy ambient glow (rate: 0.09)
  const lowerOxbloodOffset = prefersReducedMotion ? 0 : scrollY * 0.09 * motionScale;

  // Layer 5: Deep closing aura across CTA and Footer (rate: 0.06)
  const lowerClosingOffset = prefersReducedMotion ? 0 : scrollY * 0.06 * motionScale;

  return (
    <div className={cn("relative w-full overflow-x-hidden bg-[#140810]", className)}>
      {/* Base Layer 0: Fixed deep foundation gradient behind all page content */}
      <div
        className="pointer-events-none fixed inset-0 -z-30 select-none"
        style={{
          background:
            "radial-gradient(140% 100% at 50% 12%, #2a1625 0%, #1c0e19 45%, #140810 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 1: Fixed delicate geometric grid gliding at rate 0.08 */}
      <div
        className="pointer-events-none fixed inset-0 -z-25 select-none opacity-[0.045] will-change-transform"
        style={{
          transform: `translate3d(0, ${gridOffset}px, 0)`,
          backgroundImage:
            "linear-gradient(to right, #f3cbd3 1px, transparent 1px), linear-gradient(to bottom, #f3cbd3 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden="true"
      />

      {/* Layer 2: Absolute upper atmospheric sky nebula moving at rate 0.22 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[850px] -z-15 select-none will-change-transform"
        style={{
          transform: `translate3d(0, ${upperSkyOffset}px, 0)`,
          background:
            "radial-gradient(85% 55% at 50% 5%, rgba(232, 183, 194, 0.22) 0%, rgba(44, 26, 39, 0.5) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 3: Absolute mid-section horizon glow moving at rate 0.14 across features/showcase */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[750px] h-[950px] -z-15 select-none will-change-transform opacity-75"
        style={{
          transform: `translate3d(0, ${midHorizonOffset}px, 0)`,
          background:
            "radial-gradient(80% 60% at 50% 40%, rgba(243, 203, 211, 0.16) 0%, rgba(226, 125, 86, 0.07) 50%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 4: Absolute lower-mid section oxblood/burgundy glow moving at rate 0.09 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[1700px] h-[1100px] -z-15 select-none will-change-transform opacity-60"
        style={{
          transform: `translate3d(0, ${lowerOxbloodOffset}px, 0)`,
          background:
            "radial-gradient(75% 50% at 50% 30%, rgba(184, 134, 150, 0.14) 0%, rgba(22, 10, 17, 0.65) 65%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 5: Absolute closing aura across CTA and Footer moving at rate 0.06 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[2750px] h-[1300px] -z-15 select-none will-change-transform opacity-50"
        style={{
          transform: `translate3d(0, ${lowerClosingOffset}px, 0)`,
          background:
            "radial-gradient(80% 60% at 50% 40%, rgba(226, 176, 189, 0.12) 0%, rgba(35, 17, 30, 0.55) 60%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 6: Shared Full-Page Continuous Binary Orbits Particle Atmosphere (z-0: in front of glows, behind z-10 content) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <BinaryOrbits
          stars={950}
          speed={0.3}
          twist={2.5}
          tilt={0.42}
          roll={0.2}
          className="w-full h-full"
        />
      </div>

      {/* Foreground Content: Preserved stable, interactive, completely readable */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

export default ParallaxBackground;
