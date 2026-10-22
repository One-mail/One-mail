import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ingestRecentMessages } from "@/lib/gmail/ingest.ts";
import { GmailApiError, GmailAuthError } from "@/lib/gmail/errors.ts";

/**
 * POST /api/gmail/sync
 *
 * Initiates Gmail ingestion for the authenticated user:
 * - Validates session server-side
 * - Checks/refreshes Google OAuth access token
 * - Fetches up to 20 recent messages via Gmail API
 * - Normalizes and upserts Threads and Emails
 * - Updates SyncState
 * - Returns a sanitized summary (fetched, created, updated, failed)
 */
export async function POST(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Active session required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const result = await ingestRecentMessages({
      userId: session.user.id,
      maxResults: 20,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof GmailAuthError) {
      const status =
        err.code === "GMAIL_TOKEN_REVOKED"
          ? 403
          : err.code === "GMAIL_NO_ACCOUNT"
            ? 404
            : 400;

      return NextResponse.json(
        { error: err.message, code: err.code },
        { status }
      );
    }

    if (err instanceof GmailApiError) {
      const status = err.status >= 400 && err.status < 500 ? err.status : 502;
      return NextResponse.json(
        { error: err.message, code: "GMAIL_API_ERROR" },
        { status }
      );
    }

    const message = err instanceof Error ? err.message : "Sync failed";
    console.error("[gmail/sync] Unexpected sync error:", message);

    return NextResponse.json(
      { error: "An unexpected error occurred while syncing emails", code: "SYNC_FAILED" },
      { status: 500 }
    );
  }
}
