"use client";

import React, { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface RollingTextProps {
  /** The text string to animate */
  text: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Duration of individual character animation in seconds (default: 0.6) */
  duration?: number;
  /** Delay before animation starts in seconds (default: 0) */
  delay?: number;
  /** Stagger delay between characters in seconds (default: 0.035) */
  staggerDelay?: number;
  /** Compatibility alias for staggerDelay (default: undefined) */
  speed?: number;
}

/**
 * RollingText - A polished text reveal component that animates characters
 * upward with a smooth roll and opacity transition on mount.
 *
 * Fully accessible (preserves screen-reader text) and respects prefers-reduced-motion.
 */
export function RollingText({
  text,
  className,
  duration = 0.6,
  delay = 0,
  staggerDelay,
  speed,
}: RollingTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const componentId = useId();

  // Support both staggerDelay and speed for maximum flexibility
  const effectiveStagger = staggerDelay ?? speed ?? 0.035;

  // Split into words to prevent unnatural character breaking across lines
  const words = text.split(" ");
  let globalCharIndex = 0;

  return (
    <span className={cn("inline-block leading-tight", className)}>
      {/* Screen-reader accessible full text */}
      <span className="sr-only">{text}</span>

      {/* Visually animated characters */}
      <span aria-hidden="true" className="inline-flex flex-wrap">
        {words.map((word, wordIndex) => {
          const wordChars = Array.from(word);

          return (
            <span
              key={`${componentId}-word-${wordIndex}`}
              className="inline-block whitespace-nowrap"
            >
              {wordChars.map((char) => {
                const charIndex = globalCharIndex++;

                if (shouldReduceMotion) {
                  return (
                    <span
                      key={`${componentId}-char-${charIndex}`}
                      className="inline-block"
                    >
                      {char}
                    </span>
                  );
                }

                return (
                  <span
                    key={`${componentId}-char-${charIndex}`}
                    className="inline-block overflow-hidden align-baseline"
                  >
                    <motion.span
                      className="inline-block will-change-transform"
                      initial={{
                        y: "110%",
                        opacity: 0,
                        rotateX: -50,
                      }}
                      animate={{
                        y: "0%",
                        opacity: 1,
                        rotateX: 0,
                      }}
                      transition={{
                        duration,
                        delay: delay + charIndex * effectiveStagger,
                        ease: [0.16, 1, 0.3, 1], // easeOutQuart for smooth Apple-like roll
                      }}
                    >
                      {char}
                    </motion.span>
                  </span>
                );
              })}

              {/* Preserve space between words */}
              {wordIndex < words.length - 1 && (
                <span className="inline-block whitespace-pre">&nbsp;</span>
              )}
            </span>
          );
        })}
      </span>
    </span>
  );
}

export default RollingText;
