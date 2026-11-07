"use client";

import React from "react";
import Link from "next/link";
import { useDynamicIsland } from "@/app/components/ui/dynamic-island";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { showAction } = useDynamicIsland();

  return (
    <footer
      className={`border-t border-[#e2b0bd]/15 bg-[#140810]/75 backdrop-blur-md text-[#e8dbe0] ${
        className ?? ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Brand & Purpose */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e2b0bd]/20 bg-[#251220] text-[#fcf8f7] shadow-sm">
                <svg
                  className="h-3.5 w-3.5 text-[#fcf8f7]"
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
              <span className="text-sm font-semibold tracking-tight text-[#fcf8f7]">
                OneMail
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-[#cdbac0]">
              Personal email intelligence. Connects to your Gmail inbox via
              read-only OAuth, classifies incoming threads, extracts critical
              deadlines, and surfaces actionable items in the Attention Center.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>gmail.readonly scope active</span>
            </div>
          </div>

          {/* Navigation & Genuine Routes */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#d99ba9]">
              Navigation
            </h2>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#features"
                  onClick={() => showAction("Viewing Features", { icon: "nav" })}
                  className="transition-colors hover:text-[#fcf8f7]"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={() =>
                    showAction("Viewing How it works", { icon: "nav" })
                  }
                  className="transition-colors hover:text-[#fcf8f7]"
                >
                  How it works
                </a>
              </li>
              <li>
                <Link
                  href="/attention"
                  onClick={() =>
                    showAction("Opening Attention Center…", {
                      icon: "nav",
                      isLoading: true,
                    })
                  }
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#fcf8f7]"
                >
                  <span>Attention Center</span>
                  <span className="rounded bg-[#2f1828] px-1 py-0.2 text-[9px] font-mono text-[#e2b0bd]">
                    Live
                  </span>
                </Link>
              </li>
              <li>
                <a
                  href="#privacy-security"
                  onClick={() =>
                    showAction("Viewing Privacy & security", { icon: "nav" })
                  }
                  className="transition-colors hover:text-[#fcf8f7]"
                >
                  Privacy &amp; security
                </a>
              </li>
              <li>
                <Link
                  href="/login"
                  onClick={() => showAction("Opening Sign in", { icon: "nav" })}
                  className="transition-colors hover:text-[#fcf8f7]"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Verification Details */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#d99ba9]">
              Security Model
            </h2>
            <ul className="space-y-2 text-xs text-[#cdbac0]">
              <li>Google OAuth 2.0 PKCE</li>
              <li>Read-only inbox access</li>
              <li>Zero email modification</li>
              <li>Encrypted JWT session tokens</li>
              <li>Prisma &amp; PostgreSQL storage</li>
            </ul>
          </div>
        </div>

        {/* Sub-bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e2b0bd]/10 pt-8 text-[11px] text-[#cdbac0] sm:flex-row">
          <p>© {currentYear} OneMail. Built with Next.js App Router and Auth.js.</p>
          <div className="flex items-center gap-4">
            <a
              href="#privacy-security"
              onClick={() =>
                showAction("Viewing Privacy & security", { icon: "nav" })
              }
              className="text-[#cdbac0] transition-colors hover:text-[#fcf8f7]"
            >
              Privacy &amp; security policy
            </a>
            <span className="text-[#351d2e]">•</span>
            <Link
              href="/login"
              onClick={() => showAction("Opening Sign in", { icon: "nav" })}
              className="text-[#cdbac0] transition-colors hover:text-[#fcf8f7]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
