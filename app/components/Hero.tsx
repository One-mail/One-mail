"use client";

import React from "react";
import Link from "next/link";
import { GoogleSignInButton } from "@/app/components/auth/GoogleSignInButton";
import { LuminousType } from "@/app/components/ui/luminous-type";
import { ScrollTypingText } from "@/app/components/ui/scroll-typing-text";
import { useDynamicIsland } from "@/app/components/ui/dynamic-island";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
}

export function Hero({ className }: HeroProps) {
  const { showAction } = useDynamicIsland();

  return (
    <section
      className={cn(
        "relative overflow-hidden px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28 lg:px-8",
        className
      )}
      aria-label="Hero Overview"
    >
      <div className="relative mx-auto max-w-7xl">
        {/* Top System Pill with Playwrite IT Trad Typography */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e2b0bd]/20 bg-[#281724]/75 px-4 py-1.5 backdrop-blur-md shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e27d56] animate-pulse" />
            <span className="font-playwrite text-xs text-[#e2b0bd]">
              Personal Email Intelligence • Read-Only Architecture
            </span>
          </div>
        </div>

        {/* 1. Spacious Centerpiece Hero: Bitcount Ink Wordmark, Headlines, & Primary CTA */}
        <div className="mx-auto mt-8 max-w-4xl text-center">
          {/* Luminous Type Animated Brand Heading with Google Fonts Bitcount Ink */}
          <div className="overflow-visible py-2">
            <LuminousType
              text="ONEMAIL"
              as="h1"
              fontFamily='"Bitcount Ink", sans-serif'
              className="font-bitcount font-bold tracking-[0.06em] sm:tracking-[0.12em] uppercase drop-shadow-[0_4px_32px_rgba(226,176,189,0.35)] whitespace-nowrap"
              fontSize="clamp(2.75rem, 8vw, 6.25rem)"
              color="#fcf8f7"
              tint="rgba(232, 183, 194, 0.85)"
              baseOpacity={0.32}
              radius={3.8}
              softness={0.5}
              follow={0.14}
              idle="drift"
            />
          </div>

          {/* Main Headline */}
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#fcf8f7] sm:text-5xl lg:text-5xl">
            Your inbox has a lot to say.
          </h2>

          {/* Scroll-Driven Brisk Typing Supporting Headline using Lobster Two in Crisp Warm Ivory */}
          <div className="mt-3 min-h-[2.2rem]">
            <ScrollTypingText
              text="OneMail helps you see what matters."
              as="p"
              speedMs={26}
              delayMs={150}
              cursor={true}
              className="font-lobster italic text-2xl text-[#fcf8f7] sm:text-3xl tracking-wide drop-shadow-[0_2px_14px_rgba(252,248,247,0.22)]"
            />
          </div>

          {/* Supporting Description with Clear Warm Ivory High Contrast */}
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#f5ecee] sm:text-base">
            Understand important messages, identify next steps, and keep track
            of what needs your attention — without changing how you use email.
          </p>

          {/* Prominent Central Primary CTA */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <div className="w-full sm:w-auto">
              <GoogleSignInButton
                callbackUrl="/attention"
                label="Get started with Google"
                onClick={() =>
                  showAction("Starting Google sign-in", {
                    icon: "auth",
                    isActive: true,
                  })
                }
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#000000] hover:bg-[#121212] text-[#fcf8f7] font-semibold border border-[#e2b0bd]/30 hover:border-[#e2b0bd]/50 shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_20px_rgba(226,176,189,0.14)] hover:shadow-[0_4px_28px_rgba(0,0,0,0.8),0_0_24px_rgba(226,176,189,0.22)] transition-all hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2b0bd]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#140810]"
                labelClassName="text-[#fcf8f7] font-semibold text-sm"
              />
            </div>
            <Link
              href="/attention"
              onClick={() =>
                showAction("Opening Attention Center…", {
                  icon: "nav",
                  isLoading: true,
                })
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e2b0bd]/20 bg-[#281724]/80 px-6 py-4 text-sm font-medium text-[#fcf8f7] backdrop-blur-sm transition-colors hover:border-[#e2b0bd]/40 hover:bg-[#321c2c] sm:w-auto"
            >
              <span>Attention Center</span>
              <span className="text-[#e2b0bd]">→</span>
            </Link>
          </div>
        </div>

        {/* 2. Lower Side Panels: Positioned Below the Central Hero to Eliminate Cramping */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 max-w-5xl mx-auto">
          {/* Left Panel: Email Analysis */}
          <div className="relative rounded-2xl border border-[#e2b0bd]/15 bg-[#21111e]/75 p-6 backdrop-blur-md transition-all hover:border-[#e2b0bd]/30 sm:p-7 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#e2b0bd]/10 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#d99ba9]">
                Incoming Triage
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#e27d56]" />
            </div>
            <h3 className="mt-3 text-base font-semibold tracking-tight text-[#fcf8f7]">
              Email analysis
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#f0e4e7]">
              Separates urgent requests from routine mail, identifying sender
              contexts and messages waiting on your reply.
            </p>

            <div className="mt-5 divide-y divide-[#e2b0bd]/10 border-t border-[#e2b0bd]/10">
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-[#e8dbe0]">Priority scoring</span>
                <span className="font-mono text-[11px] text-[#fcf8f7]">Active</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-[#e8dbe0]">Domain sorting</span>
                <span className="font-mono text-[11px] text-[#fcf8f7]">Work / Alerts</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-[#e8dbe0]">Pending replies</span>
                <span className="font-mono text-[11px] text-[#e27d56]">Flagged</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Deadlines & Action items */}
          <div className="relative rounded-2xl border border-[#e2b0bd]/15 bg-[#21111e]/75 p-6 backdrop-blur-md transition-all hover:border-[#e2b0bd]/30 sm:p-7 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#e2b0bd]/10 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#d99ba9]">
                Next Steps
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#e27d56]" />
            </div>
            <h3 className="mt-3 text-base font-semibold tracking-tight text-[#fcf8f7]">
              Deadlines &amp; Action items
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#f0e4e7]">
              Spots hard dates, commitments, and checklist items buried inside
              email chains, pulling them into clear schedules.
            </p>

            <div className="mt-5 divide-y divide-[#e2b0bd]/10 border-t border-[#e2b0bd]/10">
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-[#e8dbe0]">Target due dates</span>
                <span className="font-mono text-[11px] text-[#fcf8f7]">Countdown</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-[#e8dbe0]">Action items</span>
                <span className="font-mono text-[11px] text-[#fcf8f7]">Checklist</span>
              </div>
              <div className="flex items-center justify-between py-2.5 text-xs">
                <span className="text-[#e8dbe0]">Destination</span>
                <Link
                  href="/attention"
                  onClick={() =>
                    showAction("Opening Attention Center…", {
                      icon: "nav",
                      isLoading: true,
                    })
                  }
                  className="font-mono text-[11px] text-[#e27d56] hover:underline"
                >
                  Attention Center →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
