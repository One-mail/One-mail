import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import { GoogleSignInButton } from "@/app/components/auth/GoogleSignInButton";
import { RollingText } from "@/app/components/ui/rolling-text";
import { AppleAIGradient } from "@/app/components/ui/apple-ai-gradient";
import { cn } from "@/lib/utils";

// Official Google Fonts "Bitcount Ink" scoped strictly to the showcase wordmark
const bitcountInk = localFont({
  src: "../fonts/BitcountInk-VariableFont.ttf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Login | OneMail",
  description: "Sign in to OneMail — Bring clarity to your inbox.",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col lg:flex-row bg-[#08080a] text-white selection:bg-zinc-800 selection:text-white overflow-x-hidden">
      {/* =========================================================================
          LEFT PANEL — Minimal Google Login
          ========================================================================= */}
      <section className="relative z-10 flex w-full flex-col justify-between p-6 sm:p-10 lg:w-[480px] lg:p-12 xl:w-[540px] xl:p-16 border-b border-zinc-800/50 lg:border-b-0 lg:border-r bg-[#08080a]">
        {/* Top: OneMail Brand Logo */}
        <header>
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
            aria-label="OneMail Home"
          >
            {/* Minimal Geometric Logo Glyph */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <svg
                className="h-4.5 w-4.5 text-zinc-100"
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
            <span className="text-xl font-bold tracking-tight text-white">
              OneMail
            </span>
          </Link>
        </header>

        {/* Center: Login Form Card */}
        <div className="my-12 flex flex-col items-center sm:items-start w-full max-w-sm mx-auto sm:mx-0">
          <div className="space-y-2 mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
              Welcome to OneMail
            </h1>
            <p className="text-sm sm:text-base text-zinc-400">
              Bring clarity to your inbox.
            </p>
          </div>

          {/* Single Google Sign-In Action */}
          <div className="w-full space-y-4">
            <GoogleSignInButton />

            {/* Subtle Security / Permission Message */}
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-zinc-400">
              <svg
                className="h-3.5 w-3.5 text-zinc-400 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Secure access. Your permission, your control.</span>
            </div>
          </div>
        </div>

        {/* Bottom: Subtle Footer Notice */}
        <footer className="text-center sm:text-left text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} OneMail. All rights reserved.</p>
        </footer>
      </section>

      {/* =========================================================================
          RIGHT PANEL — Animated Brand Showcase
          ========================================================================= */}
      <section
        className="relative flex flex-1 flex-col justify-between overflow-hidden bg-[#111115] p-6 sm:p-10 lg:p-16 xl:p-24"
        aria-label="Brand showcase"
      >
        {/* Ambient Apple AI Iridescent Glow in Background */}
        <AppleAIGradient
          intensity="medium"
          className="opacity-40 lg:opacity-50"
        />

        {/* Top: Showcase Brand Wordmark scoped with Bitcount Ink */}
        <div className="relative z-10">
          <span
            className={cn(
              "text-2xl sm:text-3xl font-bold tracking-[0.18em] text-zinc-100 select-none uppercase inline-block",
              bitcountInk.className
            )}
          >
            ONEMAIL
          </span>
        </div>

        {/* Center: Headline & Animated Rolling Phrases */}
        <div className="relative z-10 my-auto py-10 lg:py-0 max-w-xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
            Your inbox, under control.
          </h2>

          {/* Staggered Rolling Text Sequence */}
          <div className="space-y-3 sm:space-y-4 pt-2">
            <div>
              <RollingText
                text="Less noise."
                delay={0.2}
                duration={0.65}
                staggerDelay={0.035}
                className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-zinc-200"
              />
            </div>
            <div>
              <RollingText
                text="More focus."
                delay={0.6}
                duration={0.65}
                staggerDelay={0.035}
                className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-zinc-300"
              />
            </div>
            <div>
              <RollingText
                text="Nothing important missed."
                delay={1.0}
                duration={0.65}
                staggerDelay={0.035}
                className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* Bottom: Subtle Brand Assurance */}
        <div className="relative z-10 hidden sm:flex items-center gap-4 text-xs text-zinc-400 border-t border-white/5 pt-6">
          <span>Private by design</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>Real-time sync</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>Zero inbox clutter</span>
        </div>
      </section>
    </main>
  );
}
