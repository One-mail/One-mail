/**
 * lib/prisma.ts — Singleton Prisma Client for OneMail
 *
 * Uses the project's custom generated client at `generated/prisma` (not the
 * default `@prisma/client` path).
 *
 * The driver-adapter pattern (@prisma/adapter-pg) is required for Prisma 7+
 * when targeting PostgreSQL via Neon or any libSQL-style driver.
 *
 * A global singleton prevents multiple PrismaClient instances from being
 * created during Next.js hot-reload in development, which would otherwise
 * exhaust the connection pool.
 *
 * In production, `global.__prisma` is never set, so each Edge/Node.js worker
 * process gets exactly one client for its lifetime.
 */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ---------------------------------------------------------------------------
// Type augmentation so TypeScript accepts the global singleton cache.
// ---------------------------------------------------------------------------
declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "[OneMail/prisma] DATABASE_URL environment variable is not set."
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    // Only emit query events in explicit debug mode to avoid logging
    // any data that could contain sensitive email content or tokens.
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

// ---------------------------------------------------------------------------
// Export the singleton.
// ---------------------------------------------------------------------------
const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export { prisma };
export default prisma;

