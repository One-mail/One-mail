"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

export interface GoogleSignInButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  /**
   * Optional URL to redirect to after successful sign-in.
   * Defaults to the root path ("/").
   */
  callbackUrl?: string;
}

/**
 * GoogleSignInButton — Wired to Auth.js Google OAuth flow.
 *
 * Clicking this button initiates the official Auth.js `signIn("google")`
 * flow, which:
 *   1. Fetches a CSRF token from /api/auth/csrf.
 *   2. Redirects the browser to /api/auth/signin/google.
 *   3. Auth.js redirects to Google's consent page with the configured scopes.
 *   4. On approval, Google redirects to /api/auth/callback/google.
 *   5. Auth.js exchanges the code, persists User + Account via Prisma, sets
 *      the session cookie, and redirects to `callbackUrl`.
 *
 * SECURITY: signIn() is the official Auth.js client entrypoint. It handles
 * CSRF, state, and PKCE internally. No tokens are passed through this
 * component. The button has no access to OAuth credentials or tokens.
 *
 * NOTE: Google may display an "unverified app" warning for gmail.readonly
 * scope until the OAuth consent screen is submitted for verification.
 * This is expected in development.
 */
export function GoogleSignInButton({
  className,
  disabled,
  callbackUrl = "/",
  ...props
}: GoogleSignInButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleSignIn = async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      // signIn redirects the browser — it never returns on success.
      // On error, Auth.js redirects to the error page (generic message).
      await signIn("google", { callbackUrl });
    } catch {
      // If an unexpected JS error occurs before the redirect, reset the
      // loading state so the user can try again. Do not expose the error.
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={handleSignIn}
      aria-label={isPending ? "Signing in…" : "Continue with Google"}
      aria-busy={isPending}
      className={cn(
        "group relative flex w-full items-center justify-center gap-3.5 rounded-xl border border-zinc-200/90 bg-white px-5 py-3.5 text-base font-medium text-zinc-900 shadow-sm transition-all duration-150",
        "hover:bg-zinc-50 hover:shadow-md hover:border-zinc-300",
        "active:scale-[0.99] active:bg-zinc-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {/* Official Google 'G' Icon */}
      <svg
        className="h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-105"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>

      <span className="tracking-tight text-zinc-900 font-medium">
        {isPending ? "Signing in…" : "Continue with Google"}
      </span>
    </button>
  );
}

export default GoogleSignInButton;
