/**
 * lib/auth.ts — Auth.js v5 (next-auth@5.0.0-beta.32) Configuration
 *
 * SESSION STRATEGY — JWT (not "database"):
 *   The current schema is missing the `Session` and `VerificationToken`
 *   models required by the PrismaAdapter when `strategy: "database"` is used.
 *   We use `strategy: "jwt"` so Auth.js stores the session in a signed,
 *   encrypted HTTP-only cookie and never calls `p.session.*`.
 *   The PrismaAdapter is still wired in to persist `User` and `Account`
 *   records (including OAuth tokens) via `linkAccount`.
 *
 *   To switch to database sessions in the future, add the following models
 *   to prisma/schema.prisma and run a migration:
 *     - Session  (id, sessionToken, userId, expires)
 *     - VerificationToken  (identifier, token, expires)
 *
 * GMAIL SCOPES:
 *   Only `gmail.readonly` is requested at this stage. Write/send/delete
 *   scopes must NOT be added until:
 *     1. The OAuth consent screen is verified by Google for sensitive scopes.
 *     2. A security review has been completed.
 *
 * SECURITY:
 *   - Tokens are never logged, serialized into frontend props, or stored
 *     client-side. All OAuth callbacks run server-side.
 *   - Refresh token null-protection: if Google omits refresh_token on a
 *     subsequent sign-in (it only returns it on first consent or after
 *     access_token expiry), the existing stored refresh token is preserved.
 *   - Error messages shown to users are generic.
 *   - AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET are read from the
 *     environment at runtime — never hard-coded.
 *
 * TOKEN-AT-REST ASSUMPTION:
 *   OAuth access/refresh tokens are stored in the `Account` table in plain
 *   text. Production hardening should include:
 *     - Neon / PostgreSQL encryption-at-rest (enabled by default on Neon).
 *     - Column-level encryption of token fields for defence-in-depth
 *       (requires a KMS-backed key; not implemented here to avoid false
 *       security from DIY encryption).
 *     - Regular rotation of AUTH_SECRET (invalidates all existing sessions).
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // -------------------------------------------------------------------------
  // Adapter — used for User + Account persistence only (JWT session strategy
  // means Session/VerificationToken tables are never touched).
  // -------------------------------------------------------------------------
  // NOTE: The PrismaAdapter type declaration imports from `@prisma/client`,
  // but at runtime it only calls methods on the prisma object we pass in.
  // Our custom-generated PrismaClient at `generated/prisma` is structurally
  // compatible, so this cast is safe.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma as any),

  // -------------------------------------------------------------------------
  // Session — JWT strategy avoids database session tables.
  // -------------------------------------------------------------------------
  session: {
    strategy: "jwt",
    // Keep sessions alive for 30 days; the JWT is rotated on each request.
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },

  // -------------------------------------------------------------------------
  // Providers
  // -------------------------------------------------------------------------
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,

      authorization: {
        params: {
          // Identity + Gmail read-only access for background sync.
          // Do NOT add gmail.modify, gmail.send, gmail.compose, or
          // mail.google.com at this stage.
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
          ].join(" "),

          // `access_type=offline` is required to receive a refresh_token so
          // the background Gmail sync worker can call the Gmail API without
          // user interaction.
          access_type: "offline",

          // `prompt=consent` forces Google to always show the consent screen
          // and return a fresh refresh_token. Without this, Google only
          // issues a refresh_token on the very first authorization. Set to
          // "select_account" once you have confirmed the first-time flow
          // works and you are storing refresh tokens reliably.
          prompt: "consent",
        },
      },
    }),
  ],

  // -------------------------------------------------------------------------
  // Callbacks
  // -------------------------------------------------------------------------
  callbacks: {
    /**
     * jwt — called when the JWT is created (sign-in) or read (request).
     *
     * We store the internal Prisma user ID in the token so it can be
     * forwarded to the session callback and used in server components.
     *
     * SECURITY: Never place access_token, refresh_token, or id_token in the
     * JWT payload — these are already persisted in the Account table by the
     * adapter's `linkAccount` call and must not be exposed to the client.
     */
    async jwt({ token, user }) {
      // On first sign-in, `user` is populated by the adapter.
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },

    /**
     * session — shapes the public session object returned to client components.
     *
     * Only expose what the UI actually needs. Never include tokens.
     */
    async session({ session, token }) {
      if (token.userId && typeof token.userId === "string") {
        session.user.id = token.userId;
      }
      return session;
    },
  },

  // -------------------------------------------------------------------------
  // Pages — keep the existing login page as the sign-in entry point.
  // -------------------------------------------------------------------------
  pages: {
    signIn: "/login",
    // signOut, error, and verifyRequest use Auth.js defaults.
    // Generic error page prevents leaking provider details to users.
  },

  // -------------------------------------------------------------------------
  // Events — for audit logging without exposing secret values.
  // -------------------------------------------------------------------------
  events: {
    async signIn({ user, isNewUser }) {
      // Safe to log the user id and whether this is a new registration.
      // Never log tokens, emails from the raw provider response, or
      // anything from the `account` or `profile` parameter.
      console.log(
        `[auth] sign-in userId=${user.id ?? "unknown"} newUser=${isNewUser ?? false}`
      );
    },
    async signOut() {
      // Intentionally sparse — no session data logged.
      console.log("[auth] sign-out");
    },
  },
});

// ---------------------------------------------------------------------------
// Module augmentation — extend the built-in session types so server
// components can access `session.user.id` without TypeScript errors.
// ---------------------------------------------------------------------------
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId?: string;
  }
}

