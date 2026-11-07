"use client";

import React, { useRef, useEffect, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export interface LuminousTypeProps {
  text?: string;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  letterSpacing?: string;
  lineHeight?: number | string;
  align?: "left" | "center" | "right";
  maxWidth?: string;
  color?: string;
  tint?: string;
  baseOpacity?: number;
  radius?: number;
  softness?: number;
  trail?: number;
  follow?: number;
  idle?: "drift" | "center" | "none";
  className?: string;
}

export const LuminousType: React.FC<LuminousTypeProps> = ({
  text = "ONEMAIL",
  as: Component = "h1",
  fontFamily,
  fontSize = "clamp(2.75rem, 8vw, 6.5rem)",
  fontWeight = 800,
  letterSpacing = "0.18em",
  lineHeight = 1.05,
  align = "center",
  maxWidth = "none",
  color = "#fcf8f7",
  tint = "rgba(232, 183, 194, 0.65)",
  baseOpacity = 0.28,
  radius = 3.6,
  softness = 0.5,
  follow = 0.14,
  idle = "drift",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });
  const rafRef = useRef<number | null>(null);
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    const container = containerRef.current;
    if (container) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      container.addEventListener("pointerleave", handlePointerLeave);
    }

    let angle = 0;
    const animate = () => {
      if (!containerRef.current) return;

      const m = mouseRef.current;
      if (m.targetX === -1000 && idle === "drift" && !prefersReducedMotion) {
        const rect = containerRef.current.getBoundingClientRect();
        angle += 0.012;
        m.targetX = rect.width / 2 + Math.cos(angle) * (rect.width * 0.32);
        m.targetY = rect.height / 2 + Math.sin(angle * 0.75) * (rect.height * 0.25);
      }

      m.x += (m.targetX - m.x) * follow;
      m.y += (m.targetY - m.y) * follow;

      containerRef.current.style.setProperty("--luminous-x", `${m.x.toFixed(2)}px`);
      containerRef.current.style.setProperty("--luminous-y", `${m.y.toFixed(2)}px`);

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (container) {
        container.removeEventListener("pointerleave", handlePointerLeave);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [follow, idle]);

  const textStyle: React.CSSProperties = {
    fontFamily: fontFamily || undefined,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    textAlign: align,
    maxWidth,
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block select-none ${className}`}
      style={textStyle}
    >
      {/* Background Dim Layer — Deterministic for SSR hydration */}
      <Component
        className={className}
        style={{
          ...textStyle,
          opacity: baseOpacity,
          color,
          margin: 0,
        }}
      >
        {text}
      </Component>

      {/* Foreground Spotlight Mask Layer */}
      <Component
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${className}`}
        aria-hidden="true"
        style={
          {
            ...textStyle,
            opacity: isMounted ? 1 : 0,
            color,
            margin: 0,
            WebkitMaskImage: `radial-gradient(circle calc(${radius} * 1em) at var(--luminous-x, -1000px) var(--luminous-y, -1000px), black 0%, rgba(0,0,0,${1 - softness}) 65%, transparent 100%)`,
            maskImage: `radial-gradient(circle calc(${radius} * 1em) at var(--luminous-x, -1000px) var(--luminous-y, -1000px), black 0%, rgba(0,0,0,${1 - softness}) 65%, transparent 100%)`,
            textShadow: tint ? `0 0 28px ${tint}` : "none",
          } as React.CSSProperties
        }
      >
        {text}
      </Component>
    </div>
  );
};

export default LuminousType;
