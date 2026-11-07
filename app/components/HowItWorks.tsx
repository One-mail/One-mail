import React from "react";
import { ScrollTypingText } from "@/app/components/ui/scroll-typing-text";
import { cn } from "@/lib/utils";

interface HowItWorksProps {
  className?: string;
}

const STEPS = [
  {
    step: "01",
    title: "Connect your inbox",
    description:
      "Authorize your Google account with read-only permissions (gmail.readonly). OneMail never asks for permission to send, compose, or delete emails.",
    meta: "Official Google OAuth • Read-Only",
  },
  {
    step: "02",
    title: "Automatic triage",
    description:
      "Incoming emails are evaluated in the background for urgency and domain, keeping latency completely off your day-to-day inbox.",
    meta: "Background Processing • Zero Inbox Delay",
  },
  {
    step: "03",
    title: "Extracted next steps",
    description:
      "Important deadlines, event times, and checklist items are automatically identified so commitments are never buried in conversation.",
    meta: "Deadlines & Checklists Captured",
  },
  {
    step: "04",
    title: "Act with clarity",
    description:
      "Open your personal Attention Center to see what requires your attention today, upcoming deadlines, and check off tasks as you finish.",
    meta: "Attention Center • Live Dashboard",
  },
];

export function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section
      id="how-it-works"
      className={cn(
        "border-b border-[#e2b0bd]/15 bg-transparent px-4 py-20 sm:px-6 sm:py-24 lg:px-8",
        className
      )}
      aria-label="How OneMail Works"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#d99ba9]">
            Simple Process
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#fcf8f7] sm:text-4xl">
            How it works
          </h2>
          <div className="mt-3 min-h-[1.5rem]">
            <ScrollTypingText
              text="A simple, secure connection to bring clarity to your day."
              as="p"
              speedMs={24}
              delayMs={100}
              className="text-sm leading-relaxed text-[#f0e4e7]"
            />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 divide-y divide-[#e2b0bd]/15 border border-[#e2b0bd]/15 rounded-2xl overflow-hidden bg-[#1a0c16]/60 backdrop-blur-md sm:grid-cols-2 sm:divide-y-0 sm:gap-[1px] sm:bg-[#2c1726]/40 lg:grid-cols-4 shadow-xl">
          {STEPS.map((s) => (
            <div
              key={s.step}
              className="flex flex-col justify-between bg-[#190b14]/85 p-6 sm:p-8 transition-colors hover:bg-[#220f1c]/95"
            >
              <div>
                <span className="font-mono text-xs text-[#d99ba9]">
                  STEP {s.step}
                </span>
                <h3 className="mt-4 text-base font-semibold text-[#fcf8f7]">
                  {s.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#f0e4e7]">
                  {s.description}
                </p>
              </div>

              <div className="mt-6 border-t border-[#e2b0bd]/10 pt-4 font-mono text-[11px] text-[#e2b0bd]">
                {s.meta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
