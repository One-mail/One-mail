"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type GradientIntensity = "subtle" | "medium" | "strong" | "low" | "xl";

export interface AppleAIGradientProps {
  /** Optional container or glow custom CSS classes */
  className?: string;
  /** Ambient glow intensity level (default: "medium") */
  intensity?: GradientIntensity;
  /** Optional interactive preview state */
  preview?: boolean;
  /** Optional children if used as a container wrapper */
  children?: React.ReactNode;
}

const intensityMap: Record<
  GradientIntensity,
  { opacity: string; blur: string; scale: string }
> = {
  subtle: { opacity: "opacity-30", blur: "blur-2xl", scale: "scale-100" },
  low: { opacity: "opacity-30", blur: "blur-2xl", scale: "scale-100" },
  medium: { opacity: "opacity-50", blur: "blur-3xl", scale: "scale-105" },
  strong: { opacity: "opacity-75", blur: "blur-3xl", scale: "scale-110" },
  xl: { opacity: "opacity-75", blur: "blur-3xl", scale: "scale-110" },
};

/**
 * AppleAIGradient - An ambient, multi-stop iridescent glow inspired by
 * Apple Intelligence aesthetics (subtle cyan, blue, violet, and magenta accents).
 *
 * Designed specifically for login panels and card backgrounds:
 * - Positioned with pointer-events-none to prevent blocking interaction.
 * - Hardware-accelerated and throttled to prevent performance costs.
 * - Respects prefers-reduced-motion by remaining static when requested.
 */
export function AppleAIGradient({
  className,
  intensity = "medium",
  preview,
  children,
}: AppleAIGradientProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = intensityMap[intensity] ?? intensityMap.medium;

  // Active state can be explicitly forced or default to visible
  const isVisible = preview === undefined ? true : preview;

  if (!isVisible) {
    return children ? <>{children}</> : null;
  }

  const glowContent = (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none z-0",
        config.opacity,
        className
      )}
    >
      {/* Iridescent conic glow blob */}
      <motion.div
        className={cn(
          "absolute -inset-[25%] rounded-full will-change-transform",
          config.blur,
          config.scale
        )}
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, #06b6d4 0deg, #3b82f6 72deg, #8b5cf6 144deg, #d946ef 216deg, #3b82f6 288deg, #06b6d4 360deg)",
        }}
        animate={
          shouldReduceMotion
            ? { rotate: 0 }
            : {
                rotate: 360,
                scale: [1, 1.04, 0.98, 1],
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
      />

      {/* Dark radial center overlay to keep glow peripheral & subtle */}
      <div
        className="absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(10,10,10,0.85)_100%]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(10, 10, 10, 0.4) 0%, rgba(10, 10, 10, 0.92) 80%)",
        }}
      />
    </div>
  );

  if (children) {
    return (
      <div className="relative isolate">
        {glowContent}
        {children}
      </div>
    );
  }

  return glowContent;
}

export default AppleAIGradient;
