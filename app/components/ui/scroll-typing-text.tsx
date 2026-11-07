"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export interface ScrollTypingTextProps {
  /** The text string to reveal */
  text: string;
  /** HTML element wrapper */
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  /** Reveal speed in milliseconds per character (target 20-35ms) */
  speedMs?: number;
  /** Delay before typing starts after entering viewport (ms) */
  delayMs?: number;
  /** IntersectionObserver threshold (0 to 1) */
  threshold?: number;
  /** Whether to show a subtle typing cursor */
  cursor?: boolean;
  /** Custom class name */
  className?: string;
  /** Optional style overrides */
  style?: React.CSSProperties;
}

export function ScrollTypingText({
  text,
  as: Component = "span",
  speedMs = 28,
  delayMs = 120,
  threshold = 0.2,
  cursor = false,
  className,
  style,
}: ScrollTypingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayedCount, setDisplayedCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Check client-side reduced-motion safely with useSyncExternalStore
  const prefersReducedMotion = useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  useEffect(() => {
    // If reduced motion is preferred, full text is rendered immediately via revealedText
    if (prefersReducedMotion) return;

    const element = containerRef.current;
    if (!element) return;

    let delayTimer: ReturnType<typeof setTimeout> | null = null;
    let intervalTimer: ReturnType<typeof setInterval> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          // Trigger once: disconnect observer immediately to avoid retriggering on scroll
          observer.disconnect();

          delayTimer = setTimeout(() => {
            setHasStarted(true);
            let current = 0;
            intervalTimer = setInterval(() => {
              current += 1;
              setDisplayedCount(current);
              if (current >= text.length) {
                if (intervalTimer) clearInterval(intervalTimer);
                setIsComplete(true);
              }
            }, speedMs);
          }, delayMs);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (delayTimer) clearTimeout(delayTimer);
      if (intervalTimer) clearInterval(intervalTimer);
    };
  }, [text, speedMs, delayMs, threshold, prefersReducedMotion]);

  const revealedText = prefersReducedMotion
    ? text
    : text.slice(0, displayedCount);

  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={containerRef as any}
      className={cn("relative inline-block", className)}
      style={style}
    >
      {/* Screen-reader accessible: full text is always in the DOM immediately */}
      <span className="sr-only">{text}</span>

      {/* Invisible ghost element preserving exact layout dimensions to avoid layout shift */}
      <span aria-hidden="true" className="invisible select-none pointer-events-none">
        {text}
      </span>

      {/* Visible typing reveal layer positioned precisely over the ghost */}
      <span aria-hidden="true" className="absolute inset-0">
        {revealedText}
        {cursor && hasStarted && !isComplete && !prefersReducedMotion && (
          <span className="inline-block w-[2px] h-[1em] ml-0.5 bg-[#e27d56] align-middle animate-pulse" />
        )}
      </span>
    </Component>
  );
}

export default ScrollTypingText;
