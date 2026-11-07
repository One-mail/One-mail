"use client";

/**
 * Skiper76 Component Adaptation
 *
 * NOTE: This component adapts the interaction model of Skiper UI's Skiper76
 * (Apple Feature Block) — tabbed multi-stage carousel inspection with expandable
 * details — tailored specifically for OneMail's email-intelligence workflow.
 *
 * To maintain total factual honesty, it does not display fabricated emails,
 * mock customer testimonials, or fake metrics. Instead, it provides an authentic
 * workflow walkthrough and an honest empty-state mode.
 */

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ScrollTypingText } from "@/app/components/ui/scroll-typing-text";
import { useDynamicIsland } from "@/app/components/ui/dynamic-island";
import { cn } from "@/lib/utils";

export interface Skiper76Stage {
  id: string;
  label: string;
  stageBadge: string;
  headline: string;
  description: string;
  highlights: { title: string; detail: string }[];
  takeaway: string;
}

const STAGES: Skiper76Stage[] = [
  {
    id: "analysis",
    label: "Email analysis",
    stageBadge: "Stage 01 • Triage",
    headline: "Separate what matters from everyday noise.",
    description:
      "When new emails arrive, OneMail evaluates whether a message needs action or is simply informative. Important threads are elevated while newsletters and automated notifications stay out of your way.",
    highlights: [
      { title: "Priority Scoring", detail: "Distinguishes high-stakes requests from low-priority updates." },
      { title: "Sender Context", detail: "Accounts for relationship context and conversation urgency." },
      { title: "Reply Detection", detail: "Flags threads with open questions waiting on your response." },
      { title: "Zero Modification", detail: "Evaluated in read-only mode without changing your Gmail inbox." },
    ],
    takeaway: "Keeps your attention reserved for emails that actually require your decisions.",
  },
  {
    id: "deadlines",
    label: "Deadlines",
    stageBadge: "Stage 02 • Dates",
    headline: "Turn scattered dates into a clear schedule.",
    description:
      "Instead of searching through email threads for deadlines or dates, OneMail spots natural-language commitments and converts them into time-sensitive trackers.",
    highlights: [
      { title: "Automatic Detection", detail: "Recognizes dates like 'by Thursday 5 PM' or 'next week Monday'." },
      { title: "Event Commitments", detail: "Identifies scheduled meetings, presentations, and webinars." },
      { title: "Live Countdowns", detail: "Visual badges show how much time remains before an item is due." },
      { title: "Calendar Clarity", detail: "Highlights impending commitments before they slip by." },
    ],
    takeaway: "Eliminates the mental overhead of manually tracking deadlines across dozens of threads.",
  },
  {
    id: "actions",
    label: "Action items",
    stageBadge: "Stage 03 • Tasks",
    headline: "Convert long threads into clean checklists.",
    description:
      "Long discussions often bury key responsibilities. OneMail extracts concrete next steps and organizes them into concise, checkable items connected back to the original message.",
    highlights: [
      { title: "Step Extraction", detail: "Synthesizes multi-paragraph threads into clear action items." },
      { title: "Checkable Progress", detail: "Check off completed sub-tasks directly from the Attention Center." },
      { title: "Thread Linkage", detail: "Every task links directly back to its source email thread." },
      { title: "Independent Dismissal", detail: "Clear or snooze tasks without deleting anything from Gmail." },
    ],
    takeaway: "Turns unstructured email conversations into discrete, verifiable action lists.",
  },
  {
    id: "attention",
    label: "Attention Center",
    stageBadge: "Stage 04 • Dashboard",
    headline: "One unified space for what needs your focus.",
    description:
      "The Attention Center brings together all extracted priorities, countdown deadlines, and open tasks into an accessible dashboard designed for fast, focused decision-making.",
    highlights: [
      { title: "Unified Triage Feed", detail: "Sorted by urgency so you know exactly where to start." },
      { title: "Quick Detail Drawer", detail: "Inspect context, dates, and actions without opening your inbox." },
      { title: "Keyboard Ready", detail: "Quick filters for deadlines, events, and tasks." },
      { title: "Live Prototype", detail: "Fully accessible right now at the /attention route." },
    ],
    takeaway: "Start your day knowing what matters, what to do, and when to act.",
  },
];

interface Skiper76Props {
  className?: string;
}

export function Skiper76({ className }: Skiper76Props) {
  const [activeStageId, setActiveStageId] = useState<string>("analysis");
  const [isHonestState, setIsHonestState] = useState<boolean>(false);
  const { showAction } = useDynamicIsland();

  const currentStage = STAGES.find((s) => s.id === activeStageId) ?? STAGES[0];

  return (
    <section
      id="showcase"
      className={cn(
        "relative overflow-hidden border-y border-[#e2b0bd]/15 bg-transparent px-4 py-20 sm:px-6 sm:py-24 lg:px-8",
        className
      )}
      aria-label="OneMail Showcase"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-[#e2b0bd]/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e2b0bd]/20 bg-[#251522]/80 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-[#e2b0bd]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e27d56]" />
              <span>Interactive Workflow Showcase</span>
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#fcf8f7] sm:text-4xl">
              Engineered for signal, not clutter.
            </h2>
            <div className="mt-2 min-h-[1.5rem]">
              <ScrollTypingText
                text="Explore how OneMail turns passive inboxes into organized action."
                as="p"
                speedMs={24}
                delayMs={100}
                className="text-sm text-[#cdbac0] max-w-xl"
              />
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center rounded-lg border border-[#e2b0bd]/15 bg-[#20101b] p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setIsHonestState(false);
                showAction("Viewing Workflow Guide", { icon: "stage" });
              }}
              className={cn(
                "rounded-md px-3.5 py-1.5 transition-colors",
                !isHonestState
                  ? "bg-[#351d2e] text-[#fcf8f7] shadow-sm font-semibold"
                  : "text-[#cdbac0] hover:text-[#fcf8f7]"
              )}
            >
              Workflow Guide
            </button>
            <button
              type="button"
              onClick={() => {
                setIsHonestState(true);
                showAction("Viewing Unauthenticated State", { icon: "stage" });
              }}
              className={cn(
                "rounded-md px-3.5 py-1.5 transition-colors",
                isHonestState
                  ? "bg-[#351d2e] text-[#fcf8f7] shadow-sm font-semibold"
                  : "text-[#cdbac0] hover:text-[#fcf8f7]"
              )}
            >
              Unauthenticated State
            </button>
          </div>
        </div>

        {/* Apple-style Interactive Stage Selector */}
        <div className="mt-8 flex gap-2.5 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-4 sm:gap-4">
          {STAGES.map((stage) => {
            const isActive = stage.id === activeStageId && !isHonestState;
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  setActiveStageId(stage.id);
                  setIsHonestState(false);
                  showAction(`Selected: ${stage.label}`, { icon: "stage" });
                }}
                className={cn(
                  "group relative flex shrink-0 items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all sm:shrink",
                  isActive
                    ? "border-[#e2b0bd]/40 bg-[#2c1727] text-[#fcf8f7] shadow-md"
                    : "border-[#e2b0bd]/15 bg-[#1f0e1a]/80 text-[#cdbac0] hover:border-[#e2b0bd]/25 hover:bg-[#251221] hover:text-[#fcf8f7]"
                )}
              >
                <div>
                  <span className="block font-playwrite text-[11px] text-[#d99ba9]">
                    {stage.stageBadge}
                  </span>
                  <span className="mt-1 block text-sm font-semibold tracking-tight text-[#fcf8f7]">
                    {stage.label}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-mono transition-colors",
                    isActive
                      ? "border-[#e27d56] bg-[#e27d56] text-[#fcf8f7] font-bold"
                      : "border-[#e2b0bd]/20 bg-[#160a12] text-[#cdbac0] group-hover:border-[#e2b0bd]/40"
                  )}
                >
                  →
                </div>
              </button>
            );
          })}
        </div>

        {/* Feature Display Stage */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#e2b0bd]/15 bg-[#20101b]/95 p-6 backdrop-blur-md sm:p-10">
          <AnimatePresence mode="wait">
            {!isHonestState ? (
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="space-y-8"
              >
                {/* Header row */}
                <div className="flex flex-col justify-between gap-4 border-b border-[#e2b0bd]/10 pb-6 sm:flex-row sm:items-center">
                  <div>
                    <span className="font-mono text-xs text-[#d99ba9]">
                      {currentStage.stageBadge}
                    </span>
                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#fcf8f7]">
                      {currentStage.headline}
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Live Architecture</span>
                  </div>
                </div>

                <p className="max-w-3xl text-sm leading-relaxed text-[#cdbac0] sm:text-base">
                  {currentStage.description}
                </p>

                {/* Clear Highlights Matrix */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {currentStage.highlights.map((h) => (
                    <div
                      key={h.title}
                      className="rounded-xl border border-[#e2b0bd]/15 bg-[#180b14] p-5 transition-colors hover:border-[#e2b0bd]/30"
                    >
                      <h4 className="text-sm font-semibold text-[#fcf8f7]">
                        {h.title}
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-[#cdbac0]">
                        {h.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bottom Takeaway & Link */}
                <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#e2b0bd]/15 bg-[#281523]/60 p-5 text-xs sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3 text-[#cdbac0]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#e2b0bd]/30 font-mono text-[10px] text-[#fcf8f7]">
                      ✓
                    </span>
                    <span>{currentStage.takeaway}</span>
                  </div>
                  <Link
                    href="/attention"
                    onClick={() =>
                      showAction("Opening Attention Center…", {
                        icon: "nav",
                        isLoading: true,
                      })
                    }
                    className="inline-flex shrink-0 items-center gap-1.5 font-medium text-xs text-[#fcf8f7] hover:text-[#e2b0bd] transition-colors"
                  >
                    <span>Open Attention Center</span>
                    <span>→</span>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty_state"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="py-10 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e2b0bd]/20 bg-[#281523] text-[#e2b0bd]">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#fcf8f7]">
                  No Mailbox Connected Yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#cdbac0]">
                  Because you are not currently signed in, no real emails or
                  active countdowns exist. OneMail does not fabricate fake user
                  data or invented AI output.
                </p>
                <div className="mt-6 flex justify-center">
                  <Link
                    href="/attention"
                    onClick={() =>
                      showAction("Opening Attention Center…", {
                        icon: "nav",
                        isLoading: true,
                      })
                    }
                    className="rounded-xl border border-[#e2b0bd]/30 bg-[#281523]/80 px-6 py-3.5 text-xs font-medium text-[#fcf8f7] hover:border-[#e2b0bd]/50 hover:bg-[#341b2e] transition-colors shadow-sm"
                  >
                    Explore Attention Center Interface →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default Skiper76;
