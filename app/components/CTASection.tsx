"use client";

import React from "react";
import Link from "next/link";
import { ScrollTypingText } from "@/app/components/ui/scroll-typing-text";
import { useDynamicIsland } from "@/app/components/ui/dynamic-island";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  className?: string;
}

export function CTASection({ className }: CTASectionProps) {
  const { showAction } = useDynamicIsland();

  return (
    <section
      className={cn(
        "relative overflow-hidden border-t border-[#e2b0bd]/15 bg-transparent px-4 py-20 sm:px-6 sm:py-28 lg:px-8",
        className
      )}
      aria-label="Call to Action"
    >
      <div className="mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e2b0bd]/20 bg-[#2b1625]/80 px-4 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e27d56] animate-pulse" />
          <span className="font-playwrite text-xs text-[#e2b0bd]">
            One-Click Onboarding • Read-Only Scope
          </span>
        </div>

        <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#fcf8f7] sm:text-4xl lg:text-5xl">
          Ready for a clear, focused inbox?
        </h2>

        <div className="mt-3 min-h-[2.2rem]">
          <ScrollTypingText
            text="OneMail helps you see what matters."
            as="p"
            speedMs={24}
            delayMs={120}
            className="font-lobster italic text-2xl text-[#fcf8f7] sm:text-3xl tracking-wide drop-shadow-[0_2px_12px_rgba(252,248,247,0.2)]"
          />
        </div>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#f5ecee] sm:text-base">
          Connect with official Google OAuth in seconds. No inbox clutter, no
          missed commitments, and zero changes to how you send or receive mail.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/attention"
            onClick={() =>
              showAction("Opening Attention Center…", {
                icon: "nav",
                isLoading: true,
              })
            }
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl border border-[#e2b0bd]/30 bg-[#281724]/90 px-8 py-4 text-sm font-semibold text-[#fcf8f7] backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_20px_rgba(226,176,189,0.12)] transition-all hover:border-[#e2b0bd]/50 hover:bg-[#341b2e] hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Open Attention Center</span>
            <span className="text-[#e2b0bd]">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
