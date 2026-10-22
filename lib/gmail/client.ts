/**
 * Gmail API v1 Client.
 *
 * Performs typed HTTP requests to Google's Gmail API:
 * - List recent message references (`users.messages.list`)
 * - Fetch full message payloads (`users.messages.get`)
 *
 * Uses the existing pure normalization engine from `adapter.ts`.
 */

import { normalizeGmailMessageList } from "./adapter.ts";
import { GmailApiError } from "./errors.ts";
import type { GmailMessage } from "./types.ts";

export const GMAIL_API_BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me";

export interface FetchOptions {
  fetchFn?: typeof fetch;
  baseUrl?: string;
}

/**
 * Fetches recent message IDs from the authenticated user's Gmail mailbox.
 */
export async function fetchRecentMessageList(
  accessToken: string,
  maxResults = 20,
  options: FetchOptions = {}
): Promise<Array<{ id: string; threadId: string }>> {
  if (!accessToken || typeof accessToken !== "string") {
    throw new GmailApiError("Missing access token for Gmail API request", 401);
  }

  const baseUrl = options.baseUrl || GMAIL_API_BASE_URL;
  const fetchFn = options.fetchFn || fetch;
  const url = `${baseUrl}/messages?maxResults=${Math.max(1, Math.min(maxResults, 100))}`;

  let response: Response;
  try {
    response = await fetchFn(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
  } catch (err) {
    throw new GmailApiError(
      `Network error fetching Gmail message list: ${err instanceof Error ? err.message : String(err)}`,
      500
    );
  }

  if (!response.ok) {
    await handleGmailApiError(response, "Gmail API list request failed");
  }

  const data = await response.json();
  const normalizedList = normalizeGmailMessageList(data);
  return normalizedList.messages;
}

interface GoogleApiErrorPayload {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    errors?: Array<{
      message?: string;
      domain?: string;
      reason?: string;
      extendedHelp?: string;
    }>;
  };
}

async function handleGmailApiError(
  response: Response,
  defaultMessage: string
): Promise<never> {
  let errorData: GoogleApiErrorPayload | null = null;
  try {
    errorData = (await response.json()) as GoogleApiErrorPayload;
  } catch {
    // If response body is not JSON or cannot be read
  }

  const googleError = errorData?.error;
  const reason = googleError?.errors?.[0]?.reason;
  const apiMessage = googleError?.message;

  if (response.status === 401) {
    throw new GmailApiError(
      apiMessage || "Unauthorized: Google access token is invalid or expired",
      401,
      googleError
    );
  }

  if (response.status === 403) {
    if (reason === "accessNotConfigured") {
      throw new GmailApiError(
        apiMessage ||
          "Gmail API is not enabled in your Google Cloud project. Please enable it in Google Cloud Console.",
        403,
        googleError
      );
    }
    if (reason === "insufficientPermissions") {
      throw new GmailApiError(
        apiMessage ||
          "Forbidden: Insufficient permissions for Gmail read-only access",
        403,
        googleError
      );
    }
    throw new GmailApiError(
      apiMessage || "Forbidden: Access denied to Gmail API",
      403,
      googleError
    );
  }

  if (response.status === 404) {
    throw new GmailApiError(apiMessage || defaultMessage, 404, googleError);
  }

  if (response.status === 429) {
    throw new GmailApiError(
      apiMessage || "Gmail API rate limit exceeded",
      429,
      googleError
    );
  }

  throw new GmailApiError(
    apiMessage || `${defaultMessage} (HTTP ${response.status})`,
    response.status,
    googleError
  );
}

/**
 * Fetches the full Gmail message payload by message ID.
 */
export async function fetchGmailMessage(
  accessToken: string,
  messageId: string,
  options: FetchOptions = {}
): Promise<GmailMessage> {
  if (!accessToken || typeof accessToken !== "string") {
    throw new GmailApiError("Missing access token for Gmail API request", 401);
  }
  if (!messageId || typeof messageId !== "string" || !messageId.trim()) {
    throw new GmailApiError("Invalid or missing message ID", 400);
  }

  const baseUrl = options.baseUrl || GMAIL_API_BASE_URL;
  const fetchFn = options.fetchFn || fetch;
  const url = `${baseUrl}/messages/${encodeURIComponent(messageId.trim())}?format=full`;

  let response: Response;
  try {
    response = await fetchFn(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
  } catch (err) {
    throw new GmailApiError(
      `Network error fetching Gmail message: ${err instanceof Error ? err.message : String(err)}`,
      500
    );
  }

  if (!response.ok) {
    await handleGmailApiError(
      response,
      response.status === 404
        ? `Gmail message '${messageId}' not found`
        : "Gmail API get message request failed"
    );
  }

  return (await response.json()) as GmailMessage;
}
