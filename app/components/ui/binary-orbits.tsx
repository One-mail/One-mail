"use client";

/**
 * Binary Orbits — React Bits Pro Galaxy Background Specification
 *
 * Implements a 3D-tilted logarithmic spiral particle galaxy with inner/outer
 * orbital velocity, OKLab-inspired color blending, responsive particle density,
 * reliable viewport sizing, and zero pointer interference.
 */

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export interface BinaryOrbitsProps {
  /** Number of particles (default: 950 on desktop, scaled on mobile) */
  stars?: number;
  /** Particle radius size */
  starSize?: number;
  /** Number of spiral arms (1 - 8, default: 2) */
  arms?: number;
  /** Spiral curvature tightness (default: 2.5) */
  twist?: number;
  /** Orbital velocity (default: 0.32) */
  speed?: number;
  /** 3D viewing angle tilt (default: 0.42) */
  tilt?: number;
  /** 3D rotation roll (default: 0.2) */
  roll?: number;
  /** Color palette for inner core, outer arms, and cosmic dust */
  colors?: {
    core?: string;
    arm?: string;
    dust?: string;
  };
  /** Background canvas tint (default: transparent) */
  backgroundColor?: string;
  /** Optional class name */
  className?: string;
}

interface StarParticle {
  r: number; // distance from center
  baseTheta: number; // base angular position
  armIndex: number;
  speed: number;
  size: number;
  alpha: number;
  colorType: "core" | "arm" | "dust";
}

export function BinaryOrbits({
  stars = 950,
  starSize = 1.35,
  arms = 2,
  twist = 2.5,
  speed = 0.32,
  tilt = 0.42,
  roll = 0.2,
  colors = {
    core: "rgba(255, 255, 255, 0.95)",
    arm: "rgba(240, 195, 205, 0.85)",
    dust: "rgba(235, 145, 110, 0.75)",
  },
  backgroundColor = "transparent",
  className,
}: BinaryOrbitsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const prefersReducedMotion = useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;

    const getDimensions = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 1200);
      const h = parent?.clientHeight || (typeof window !== "undefined" ? window.innerHeight : 800);
      return {
        width: Math.max(w, 320),
        height: Math.max(h, 400),
      };
    };

    let { width, height } = getDimensions();
    canvas.width = width;
    canvas.height = height;

    const isMobile = width < 768;
    const effectiveStars = isMobile ? Math.min(stars, 380) : stars;

    // Generate logarithmic spiral star particles
    const generateParticles = (w: number, h: number) => {
      const list: StarParticle[] = [];
      const maxRadius = Math.max(w, h) * 0.58;

      for (let i = 0; i < effectiveStars; i++) {
        const armIndex = i % arms;
        // Exponential distribution towards center with widespread reach
        const rRatio = Math.pow(Math.random(), 1.6);
        const r = 16 + rRatio * maxRadius;

        // Logarithmic spiral angle + dispersion jitter
        const spiralTheta = rRatio * twist * Math.PI;
        const jitter = (Math.random() - 0.5) * (0.35 + rRatio * 0.45);
        const baseTheta = (armIndex * (2 * Math.PI)) / arms + spiralTheta + jitter;

        // Inner stars orbit faster
        const orbitalSpeed = (speed * 0.008) / Math.sqrt(r * 0.035 + 1);

        // Color classification
        const colorType: "core" | "arm" | "dust" =
          rRatio < 0.2
            ? "core"
            : Math.random() < 0.28
            ? "dust"
            : "arm";

        list.push({
          r,
          baseTheta,
          armIndex,
          speed: orbitalSpeed,
          size: starSize * (0.6 + Math.random() * 0.9),
          alpha: 0.4 + Math.random() * 0.6,
          colorType,
        });
      }
      return list;
    };

    let particleList = generateParticles(width, height);

    const cosTilt = Math.cos(tilt);
    const sinRoll = Math.sin(roll);
    const cosRoll = Math.cos(roll);

    let currentRotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      const centerX = width / 2;
      const centerY = height * 0.42;

      // Soft luminous galactic core glow
      const coreRadius = Math.min(width, height) * 0.32;
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        coreRadius
      );
      coreGradient.addColorStop(0, "rgba(240, 195, 205, 0.22)");
      coreGradient.addColorStop(0.45, "rgba(226, 125, 86, 0.09)");
      coreGradient.addColorStop(1, "transparent");

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Render star particles with 3D projection
      for (let i = 0; i < particleList.length; i++) {
        const p = particleList[i];
        if (!prefersReducedMotion) {
          p.baseTheta += p.speed;
        }

        const theta = p.baseTheta + currentRotation;
        const x2d = p.r * Math.cos(theta);
        const y2d = p.r * Math.sin(theta);

        // Apply 3D tilt & roll
        const yTilted = y2d * cosTilt;
        const xProjected = x2d * cosRoll - yTilted * sinRoll;
        const yProjected = x2d * sinRoll + yTilted * cosRoll;

        const screenX = centerX + xProjected;
        const screenY = centerY + yProjected;

        // Skip particles far outside visible viewport bounds
        if (
          screenX < -50 ||
          screenX > width + 50 ||
          screenY < -50 ||
          screenY > height + 50
        ) {
          continue;
        }

        // Choose color
        let fill = colors.arm ?? "rgba(240, 195, 205, 0.85)";
        if (p.colorType === "core") fill = colors.core ?? "rgba(255, 255, 255, 0.95)";
        if (p.colorType === "dust") fill = colors.dust ?? "rgba(235, 145, 110, 0.75)";

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;

      if (!prefersReducedMotion) {
        currentRotation += speed * 0.001;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    const handleResize = () => {
      const dims = getDimensions();
      if (Math.abs(dims.width - width) > 40 || Math.abs(dims.height - height) > 40) {
        width = canvas.width = dims.width;
        height = canvas.height = dims.height;
        particleList = generateParticles(width, height);
      }
      if (prefersReducedMotion) render();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    stars,
    starSize,
    arms,
    twist,
    speed,
    tilt,
    roll,
    colors,
    backgroundColor,
    prefersReducedMotion,
  ]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        className
      )}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}

export default BinaryOrbits;
