/**
 * Gmail Ingestion Engine.
 *
 * Orchestrates:
 * 1. Authenticated user isolation
 * 2. Automatic OAuth token validation and refresh
 * 3. Recent message retrieval from Gmail API v1
 * 4. Normalization using the existing adapter
 * 5. Idempotent persistence into OneMail's `Thread`, `Email`, and `SyncState` models
 * 6. Redaction of tokens and full email bodies from logs and return objects
 */

import { prisma as defaultPrisma } from "../prisma.ts";
import { normalizeGmailMessage } from "./adapter.ts";
import { fetchGmailMessage, fetchRecentMessageList } from "./client.ts";
import { GmailAuthError } from "./errors.ts";
import { getValidGoogleAccessToken } from "./token.ts";
import type { PrismaClient } from "../../generated/prisma/client.ts";

export interface IngestOptions {
  userId: string;
  maxResults?: number;
  // Dependency injection for isolated unit testing
  accessToken?: string;
  prismaClient?: PrismaClient;
  fetchFn?: typeof fetch;
}

export interface IngestResult {
  success: boolean;
  fetched: number;
  created: number;
  updated: number;
  failed: number;
  errors?: string[];
}

/**
 * Ingests the authenticated user's recent Gmail messages into the database.
 */
export async function ingestRecentMessages(
  options: IngestOptions
): Promise<IngestResult> {
  const { userId, maxResults = 20 } = options;

  if (!userId || typeof userId !== "string" || !userId.trim()) {
    throw new GmailAuthError("A valid user ID is required for ingestion", "GMAIL_INVALID_USER");
  }

  const prisma = options.prismaClient || defaultPrisma;
  const fetchFn = options.fetchFn || fetch;

  // 1. Obtain a valid Google access token (cached or refreshed)
  const accessToken =
    options.accessToken ||
    (await getValidGoogleAccessToken(userId, {
      prismaClient: prisma,
      fetchFn,
    }));

  // 2. Fetch recent message list from Gmail API
  const messageRefs = await fetchRecentMessageList(accessToken, maxResults, { fetchFn });

  if (!messageRefs || messageRefs.length === 0) {
    // Record sync timestamp even if mailbox is empty
    await prisma.syncState.upsert({
      where: { userId },
      create: {
        userId,
        lastSyncedAt: new Date(),
      },
      update: {
        lastSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      fetched: 0,
      created: 0,
      updated: 0,
      failed: 0,
    };
  }

  let created = 0;
  let updated = 0;
  let failed = 0;
  const errors: string[] = [];
  let latestHistoryId: string | null = null;

  // 3. Process each message sequentially to avoid rate-limiting and ensure deterministic state
  for (const ref of messageRefs) {
    try {
      const rawMessage = await fetchGmailMessage(accessToken, ref.id, { fetchFn });
      const normalized = normalizeGmailMessage(rawMessage);

      // Track latest history ID
      if (normalized.historyId) {
        if (!latestHistoryId || normalized.historyId > latestHistoryId) {
          latestHistoryId = normalized.historyId;
        }
      }

      // 4. Idempotently upsert Thread scoped strictly to this user
      const thread = await prisma.thread.upsert({
        where: {
          userId_gmailThreadId: {
            userId,
            gmailThreadId: normalized.gmailThreadId,
          },
        },
        create: {
          userId,
          gmailThreadId: normalized.gmailThreadId,
          subject: normalized.subject,
          snippet: normalized.snippet,
        },
        update: {
          snippet: normalized.snippet ?? undefined,
          subject: normalized.subject ?? undefined,
        },
      });

      // 5. Idempotently check and persist Email scoped strictly to this user
      const existingEmail = await prisma.email.findUnique({
        where: {
          userId_gmailMessageId: {
            userId,
            gmailMessageId: normalized.gmailMessageId,
          },
        },
        select: { id: true },
      });

      // Prepare Json values safely
      const recipientsJson = normalized.recipients as unknown as object[];
      const ccJson = normalized.cc as unknown as object[];
      const bccJson = normalized.bcc as unknown as object[];

      if (existingEmail) {
        await prisma.email.update({
          where: { id: existingEmail.id },
          data: {
            snippet: normalized.snippet,
            bodyText: normalized.bodyText,
            bodyHtml: normalized.bodyHtml,
            recipients: recipientsJson,
            cc: ccJson,
            bcc: bccJson,
          },
        });
        updated++;
      } else {
        await prisma.email.create({
          data: {
            userId,
            threadId: thread.id,
            gmailMessageId: normalized.gmailMessageId,
            gmailThreadId: normalized.gmailThreadId,
            sender: normalized.senderFormatted,
            recipients: recipientsJson,
            cc: ccJson,
            bcc: bccJson,
            subject: normalized.subject,
            snippet: normalized.snippet,
            bodyText: normalized.bodyText,
            bodyHtml: normalized.bodyHtml,
            receivedAt: normalized.receivedAt,
          },
        });
        created++;
      }
    } catch (err) {
      failed++;
      const errorMessage = err instanceof Error ? err.message : String(err);
      // Log sanitized warning (no tokens or email bodies)
      console.warn(`[gmail-ingest] Error ingesting message ${ref.id}: ${errorMessage}`);
      errors.push(`Message ${ref.id}: ${errorMessage}`);
    }
  }

  // 6. Update SyncState with actual sync results
  await prisma.syncState.upsert({
    where: { userId },
    create: {
      userId,
      historyId: latestHistoryId,
      lastSyncedAt: new Date(),
    },
    update: {
      ...(latestHistoryId ? { historyId: latestHistoryId } : {}),
      lastSyncedAt: new Date(),
    },
  });

  return {
    success: failed === 0 || created + updated > 0,
    fetched: messageRefs.length,
    created,
    updated,
    failed,
    ...(errors.length > 0 ? { errors: errors.slice(0, 5) } : {}),
  };
}
