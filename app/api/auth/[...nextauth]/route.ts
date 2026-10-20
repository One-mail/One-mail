/**
 * app/api/auth/[...nextauth]/route.ts
 *
 * Mounts the Auth.js v5 HTTP handlers on the Next.js App Router catch-all
 * route `/api/auth/[...nextauth]`.
 *
 * This single file handles all Auth.js endpoints:
 *   GET  /api/auth/session          — returns the current session
 *   GET  /api/auth/providers        — lists configured providers
 *   GET  /api/auth/csrf             — returns the CSRF token
 *   GET  /api/auth/signin           — sign-in page redirect
 *   GET  /api/auth/signout          — sign-out page redirect
 *   GET  /api/auth/callback/google  — Google OAuth callback (receives code)
 *   POST /api/auth/signin/google    — initiates Google sign-in
 *   POST /api/auth/signout          — processes sign-out
 *
 * SECURITY:
 *   - All OAuth state, PKCE verifiers, and tokens are handled server-side by
 *     Auth.js. Nothing from the Google callback is forwarded to the client.
 *   - CSRF protection is enforced by Auth.js on every POST.
 *   - Cookies are HttpOnly, Secure (in production), and SameSite=Lax by
 *     Auth.js defaults. Do NOT override these settings.
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;