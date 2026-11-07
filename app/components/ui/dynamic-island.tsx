"use client";

/**
 * DynamicIsland — Inspired by Skiper2 & Apple Dynamic Island Interaction Model
 *
 * Requirements:
 * - Hidden/collapsed when idle (no persistent "ONEMAIL" banner).
 * - Fixed near top-center only while active; never reserves layout space or shifts content.
 * - Smooth spring physics on appearance and auto-collapse after action completion.
 * - Pure black (#000000) with restrained neon accents (cyan, neon green, violet).
 * - Clear white text for announcements.
 * - Animated neon spinner and loading state for Attention Center navigation.
 * - Zero interference with underlying links, buttons, or Google OAuth flow.
 * - Auto-cleanup on route changes, pageshow, and rapid click debounce.
 */

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export interface DynamicIslandAction {
  message: string;
  subtext?: string;
  icon?: "nav" | "auth" | "stage" | "external" | "default";
  isActive?: boolean;
  isLoading?: boolean;
}

interface DynamicIslandContextValue {
  showAction: (
    message: string,
    options?: {
      subtext?: string;
      icon?: "nav" | "auth" | "stage" | "external" | "default";
      isActive?: boolean;
      isLoading?: boolean;
      durationMs?: number;
    }
  ) => void;
  hideAction: () => void;
  currentAction: DynamicIslandAction | null;
}

const DynamicIslandContext = createContext<DynamicIslandContextValue | null>(null);

export function useDynamicIsland() {
  const context = useContext(DynamicIslandContext);
  if (!context) {
    // Graceful fallback if used outside provider so components don't crash
    return {
      showAction: () => {},
      hideAction: () => {},
      currentAction: null,
    };
  }
  return context;
}

interface DynamicIslandProviderProps {
  children: React.ReactNode;
}

export function DynamicIslandProvider({ children }: DynamicIslandProviderProps) {
  const [currentAction, setCurrentAction] = useState<DynamicIslandAction | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  const prefersReducedMotion = useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  const hideAction = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCurrentAction(null);
  }, []);

  const showAction = useCallback(
    (
      message: string,
      options?: {
        subtext?: string;
        icon?: "nav" | "auth" | "stage" | "external" | "default";
        isActive?: boolean;
        isLoading?: boolean;
        durationMs?: number;
      }
    ) => {
      // Rapid click debounce: cancel pending collapse immediately
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const action: DynamicIslandAction = {
        message,
        subtext: options?.subtext,
        icon: options?.icon ?? "default",
        isActive: options?.isActive,
        isLoading: options?.isLoading,
      };

      setCurrentAction(action);

      // Auto-collapse: ~2100ms for standard messages, or ~2800ms for navigation loading state
      // Ongoing active states (e.g. Google OAuth redirect) stay until navigation/auth finishes
      if (!options?.isActive) {
        const delay = options?.durationMs ?? (options?.isLoading ? 2800 : 2100);
        timerRef.current = setTimeout(() => {
          setCurrentAction(null);
          timerRef.current = null;
        }, delay);
      }
    },
    []
  );

  // Auto-cleanup on pathname navigation so loading state dismisses cleanly once route changes
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      // When arriving at the destination page, gracefully dismiss the island after a brief moment
      const t = setTimeout(() => {
        hideAction();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [pathname, hideAction]);

  // Prevent stale loading state if user returns to page via back/forward cache
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        hideAction();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hideAction]);

  return (
    <DynamicIslandContext.Provider value={{ showAction, hideAction, currentAction }}>
      {children}

      {/* Accessible Live Region for Screen Readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {currentAction?.message}
      </div>

      {/* Floating Dynamic Island UI — Hidden when idle; fixed top-center when active */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
        <AnimatePresence mode="wait">
          {currentAction && (
            <motion.div
              key="dynamic-island-active"
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.85, y: -12 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.88, y: -10 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 420, damping: 26 }
              }
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-full",
                "bg-[#000000] backdrop-blur-2xl",
                currentAction.isLoading
                  ? "border border-[#00f0ff]/40 shadow-[0_12px_40px_rgba(0,0,0,0.95),0_0_24px_rgba(0,240,255,0.25)]"
                  : currentAction.icon === "auth"
                  ? "border border-[#ff7a45]/35 shadow-[0_12px_40px_rgba(0,0,0,0.95),0_0_18px_rgba(255,122,69,0.2)]"
                  : currentAction.icon === "stage"
                  ? "border border-[#00ff88]/35 shadow-[0_12px_40px_rgba(0,0,0,0.95),0_0_18px_rgba(0,255,136,0.2)]"
                  : "border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.95),0_0_18px_rgba(168,85,247,0.18)]",
                "text-white"
              )}
            >
              {/* Contextual Status Glyphs with Neon Accents */}
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 border border-white/10">
                {currentAction.isLoading ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-[#00f0ff] border-t-transparent animate-spin shadow-[0_0_8px_#00f0ff]" />
                ) : currentAction.icon === "auth" ? (
                  <span className="h-2 w-2 rounded-full bg-[#ff7a45] shadow-[0_0_8px_#ff7a45] animate-pulse" />
                ) : currentAction.icon === "stage" ? (
                  <span className="h-2 w-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
                )}
              </div>

              {/* Action Message Text in Clear White */}
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold tracking-tight text-white">
                  {currentAction.message}
                </span>
                {currentAction.subtext && (
                  <span className="text-[10px] font-mono text-zinc-400">
                    {currentAction.subtext}
                  </span>
                )}
              </div>

              {/* Neon Status Badge */}
              {currentAction.isLoading ? (
                <span className="rounded-full bg-cyan-950/80 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                  Navigating
                </span>
              ) : currentAction.isActive ? (
                <span className="rounded-full bg-amber-950/80 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-[#ffaa6b] border border-amber-500/30">
                  Connecting
                </span>
              ) : currentAction.icon === "stage" ? (
                <span className="rounded-full bg-emerald-950/80 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-[#00ff88] border border-emerald-500/30">
                  Stage
                </span>
              ) : (
                <span className="rounded-full bg-purple-950/80 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-[#c084fc] border border-purple-500/30">
                  OneMail
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DynamicIslandContext.Provider>
  );
}

export default DynamicIslandProvider;
