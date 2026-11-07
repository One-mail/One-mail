import type { Metadata } from "next";
import { Navbar } from "@/app/components/Navbar";
import { Hero } from "@/app/components/Hero";
import { Skiper76 } from "@/app/components/ui/skiper76";
import { HowItWorks } from "@/app/components/HowItWorks";
import { Features } from "@/app/components/Features";
import { CTASection } from "@/app/components/CTASection";
import { Footer } from "@/app/components/Footer";
import { ParallaxBackground } from "@/app/components/ui/parallax-background";
import { ScrollTypingText } from "@/app/components/ui/scroll-typing-text";

export const metadata: Metadata = {
  title: "OneMail — Personal Email Intelligence & Attention Center",
  description:
    "AI-powered personal email intelligence. Automatically classify emails, extract deadlines, and triage actions with read-only Gmail access.",
};

export default function Home() {
  return (
    <ParallaxBackground className="min-h-screen text-[#fcf8f7] flex flex-col selection:bg-[#e27d56]/30 selection:text-[#fcf8f7]">
      {/* 1. Consistent Top Navigation with Dynamic Island Feedback */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero: What OneMail helps users achieve */}
        <Hero />

        {/* 3. Main Product Showcase (Skiper76 Apple-style Feature Block) */}
        <Skiper76 />

        {/* 4. How It Works (Concise 4-Step Pipeline Overview) */}
        <HowItWorks />

        {/* 5. Core Benefits (Clarity Without Compromise) */}
        <Features />

        {/* 6. Accurate Privacy & Security Information */}
        <section
          id="privacy-security"
          className="border-b border-[#e2b0bd]/15 bg-transparent px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
          aria-label="Privacy and Security"
        >
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-[#d99ba9]">
                Data Protection
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#fcf8f7] sm:text-4xl">
                Privacy &amp; security
              </h2>
              <div className="mt-3 min-h-[1.5rem]">
                <ScrollTypingText
                  text="Built with strict permission boundaries so your inbox stays protected."
                  as="p"
                  speedMs={24}
                  delayMs={120}
                  className="mx-auto max-w-xl text-sm leading-relaxed text-[#f0e4e7]"
                />
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#e2b0bd]/15 bg-[#1f0e1a]/70 p-6 backdrop-blur-md transition-all hover:border-[#e2b0bd]/30 shadow-lg">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#d99ba9]">
                  01 / Scope
                </span>
                <h3 className="mt-2 text-base font-semibold text-[#fcf8f7]">
                  Read-Only Gmail Access
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#f0e4e7]">
                  OneMail requests exclusively{" "}
                  <code className="rounded bg-[#2a1324] px-1.5 py-0.5 font-mono text-[11px] text-[#f3cbd3]">
                    gmail.readonly
                  </code>
                  . We cannot compose, send, modify, or delete your emails.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e2b0bd]/15 bg-[#1f0e1a]/70 p-6 backdrop-blur-md transition-all hover:border-[#e2b0bd]/30 shadow-lg">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#d99ba9]">
                  02 / Credentials
                </span>
                <h3 className="mt-2 text-base font-semibold text-[#fcf8f7]">
                  Server-Encrypted Tokens
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#f0e4e7]">
                  All OAuth tokens remain securely encrypted on the server.
                  Your authentication keys are never exposed to the client or browser.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e2b0bd]/15 bg-[#1f0e1a]/70 p-6 backdrop-blur-md transition-all hover:border-[#e2b0bd]/30 shadow-lg">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#d99ba9]">
                  03 / Sessions
                </span>
                <h3 className="mt-2 text-base font-semibold text-[#fcf8f7]">
                  Protected Private Sessions
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#f0e4e7]">
                  Modern industry-standard encrypted sessions protect your account
                  boundaries without exposing sensitive inbox details.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Final Call to Action */}
        <CTASection />
      </main>

      {/* 8. Consolidated Footer */}
      <Footer />
    </ParallaxBackground>
  );
}
