import React from "react";
import { ScrollTypingText } from "@/app/components/ui/scroll-typing-text";
import { cn } from "@/lib/utils";

interface FeaturesProps {
  className?: string;
}

const BENEFIT_LIST = [
  {
    label: "Priority Intelligence",
    category: "Signal Over Noise",
    description:
      "Separates urgent requests from routine mail, identifying sender urgency and messages waiting on your reply without complicated rules.",
    detail: "Context-aware triage",
  },
  {
    label: "Automated Commitments",
    category: "Schedule Clarity",
    description:
      "Detects conversational deadlines, meeting dates, and time commitments buried across threads, turning them into visual countdowns.",
    detail: "Due date tracking",
  },
  {
    label: "Actionable Checklists",
    category: "Concrete Tasks",
    description:
      "Synthesizes discrete, checkable items from multi-paragraph discussions so you can take action without rereading entire chains.",
    detail: "Direct thread links",
  },
  {
    label: "Zero Inbox Risk",
    category: "Privacy By Design",
    description:
      "Operates exclusively in read-only mode via official Google OAuth. OneMail never alters, composes, sends, or deletes any email.",
    detail: "gmail.readonly scope",
  },
];

export function Features({ className }: FeaturesProps) {
  return (
    <section
      id="features"
      className={cn(
        "border-b border-[#e2b0bd]/15 bg-transparent px-4 py-20 sm:px-6 sm:py-24 lg:px-8",
        className
      )}
      aria-label="Core Benefits"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-widest text-[#d99ba9]">
            Core Benefits
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#fcf8f7] sm:text-4xl">
            Clarity without compromise.
          </h2>
          <div className="mt-3 min-h-[1.5rem]">
            <ScrollTypingText
              text="Engineered to help you focus on what matters most in your inbox."
              as="p"
              speedMs={25}
              delayMs={120}
              className="text-sm leading-relaxed text-[#f0e4e7]"
            />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFIT_LIST.map((benefit) => (
            <div
              key={benefit.label}
              className="flex flex-col justify-between rounded-2xl border border-[#e2b0bd]/15 bg-[#1f0e1a]/70 p-6 backdrop-blur-md transition-all hover:border-[#e2b0bd]/30 sm:p-7 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#e2b0bd]/10 pb-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#d99ba9]">
                    {benefit.category}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e27d56]" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#fcf8f7]">
                  {benefit.label}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#f0e4e7]">
                  {benefit.description}
                </p>
              </div>

              <div className="mt-6 border-t border-[#e2b0bd]/10 pt-4 font-mono text-[11px] text-[#e2b0bd]">
                {benefit.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
