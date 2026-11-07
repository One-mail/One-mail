"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDynamicIsland } from "@/app/components/ui/dynamic-island";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showAction } = useDynamicIsland();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-[#e2b0bd]/15 bg-[#140810]/80 backdrop-blur-md transition-colors",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            onClick={() => showAction("Viewing OneMail Home", { icon: "nav" })}
            className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2b0bd] focus-visible:ring-offset-2 focus-visible:ring-offset-[#170a13]"
            aria-label="OneMail Home"
          >
            <Image
              src="/images/onemail-logo.png"
              alt="OneMail logo"
              width={903}
              height={618}
              className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105 sm:h-9"
              priority
            />
          </Link>

          <span className="hidden items-center rounded border border-[#e2b0bd]/15 bg-[#251220]/80 px-2 py-0.5 font-playwrite text-[11px] text-[#d99ba9] sm:inline-flex">
            Intelligence
          </span>
        </div>

        {/* Desktop Standard Navigation Links */}
        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Primary navigation"
        >
          <a
            href="#how-it-works"
            onClick={() => showAction("Viewing How it works", { icon: "nav" })}
            className="text-xs font-medium tracking-wide text-[#f0e4e7] transition-colors hover:text-[#fcf8f7]"
          >
            How it works
          </a>
          <a
            href="#features"
            onClick={() => showAction("Viewing Features", { icon: "nav" })}
            className="text-xs font-medium tracking-wide text-[#f0e4e7] transition-colors hover:text-[#fcf8f7]"
          >
            Features
          </a>
          <Link
            href="/attention"
            onClick={() =>
              showAction("Opening Attention Center…", {
                icon: "nav",
                isLoading: true,
              })
            }
            className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-[#f0e4e7] transition-colors hover:text-[#fcf8f7]"
          >
            <span>Attention Center</span>
            <span className="rounded bg-[#2f1828] px-1.5 py-0.2 text-[9px] font-mono text-[#e2b0bd]">
              Live
            </span>
          </Link>
          <a
            href="#privacy-security"
            onClick={() =>
              showAction("Viewing Privacy & security", { icon: "nav" })
            }
            className="text-xs font-medium tracking-wide text-[#f0e4e7] transition-colors hover:text-[#fcf8f7]"
          >
            Privacy &amp; security
          </a>
        </nav>

        {/* Right Nav Action: Clean, accessible Sign in */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            onClick={() => showAction("Opening Sign in", { icon: "nav" })}
            className="rounded-lg border border-[#e2b0bd]/20 bg-[#281724]/60 px-4 py-2 text-xs font-medium text-[#f0e4e7] transition-all hover:border-[#e2b0bd]/40 hover:bg-[#321c2c] hover:text-[#fcf8f7]"
          >
            Sign in
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/login"
            onClick={() => showAction("Opening Sign in", { icon: "nav" })}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-[#cdbac0] hover:text-[#fcf8f7]"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e2b0bd]/20 bg-[#251220] text-[#fcf8f7] transition-colors hover:bg-[#32172a]"
          >
            {mobileMenuOpen ? (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-[#e2b0bd]/15 bg-[#140810]/95 px-4 py-5 sm:hidden">
          <div className="space-y-3">
            <a
              href="#how-it-works"
              onClick={() => {
                setMobileMenuOpen(false);
                showAction("Viewing How it works", { icon: "nav" });
              }}
              className="block rounded-lg px-3 py-2 text-sm text-[#f0e4e7] hover:bg-[#251220] hover:text-[#fcf8f7]"
            >
              How it works
            </a>
            <a
              href="#features"
              onClick={() => {
                setMobileMenuOpen(false);
                showAction("Viewing Features", { icon: "nav" });
              }}
              className="block rounded-lg px-3 py-2 text-sm text-[#f0e4e7] hover:bg-[#251220] hover:text-[#fcf8f7]"
            >
              Features
            </a>
            <Link
              href="/attention"
              onClick={() => {
                setMobileMenuOpen(false);
                showAction("Opening Attention Center…", {
                  icon: "nav",
                  isLoading: true,
                });
              }}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#f0e4e7] hover:bg-[#251220] hover:text-[#fcf8f7]"
            >
              <span>Attention Center</span>
              <span className="rounded bg-[#2f1828] px-1.5 py-0.5 text-[10px] font-mono text-[#e2b0bd]">
                Live
              </span>
            </Link>
            <a
              href="#privacy-security"
              onClick={() => {
                setMobileMenuOpen(false);
                showAction("Viewing Privacy & security", { icon: "nav" });
              }}
              className="block rounded-lg px-3 py-2 text-sm text-[#f0e4e7] hover:bg-[#251220] hover:text-[#fcf8f7]"
            >
              Privacy &amp; security
            </a>
            <Link
              href="/login"
              onClick={() => {
                setMobileMenuOpen(false);
                showAction("Opening Sign in", { icon: "nav" });
              }}
              className="block rounded-lg px-3 py-2 text-sm text-[#f0e4e7] hover:bg-[#251220] hover:text-[#fcf8f7]"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
