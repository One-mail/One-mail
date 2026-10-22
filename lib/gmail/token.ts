/**
 * Secure Google OAuth Token Retrieval and Refresh.
 *
 * Handles:
 * - Stored token lookup for the authenticated user
 * - Expiry checks with safety buffer
 * - Server-side OAuth token refresh against Google's token endpoint
 * - Revoked/expired grant error handling
 * - Atomic persistence of new access tokens without overwriting existing refresh tokens
 */

import { prisma as defaultPrisma } from "../prisma.ts";
import { GmailAuthError } from "./errors.ts";

export const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
export const TOKEN_EXPIRY_BUFFER_SECONDS = 300; // 5 minutes

export interface RefreshedTokenResult {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface RefreshTokenOptions {
  clientId?: string;
  clientSecret?: string;
  tokenEndpoint?: string;
  fetchFn?: typeof fetch;
}

/**
 * Calls Google's OAuth 2.0 token endpoint to exchange a refresh token for a fresh access token.
 */
export async function refreshGoogleAccessToken(
  refreshToken: string,
  options: RefreshTokenOptions = {}
): Promise<RefreshedTokenResult> {
  if (!refreshToken || typeof refreshToken !== "string" || !refreshToken.trim()) {
    throw new GmailAuthError(
      "Missing or invalid refresh token",
      "GMAIL_MISSING_REFRESH_TOKEN"
    );
  }

  const clientId = options.clientId || process.env.AUTH_GOOGLE_ID;
  const clientSecret = options.clientSecret || process.env.AUTH_GOOGLE_SECRET;
  const tokenEndpoint = options.tokenEndpoint || GOOGLE_TOKEN_ENDPOINT;
  const fetchFn = options.fetchFn || fetch;

  if (!clientId || !clientSecret) {
    throw new GmailAuthError(
      "Google OAuth credentials (AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET) are not configured",
      "GMAIL_CONFIG_ERROR"
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken.trim(),
  });

  let response: Response;
  try {
    response = await fetchFn(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });
  } catch (err) {
    throw new GmailAuthError(
      `Network error connecting to Google token endpoint: ${err instanceof Error ? err.message : String(err)}`,
      "GMAIL_NETWORK_ERROR"
    );
  }

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const errorType = typeof data.error === "string" ? data.error : "";
    if (errorType === "invalid_grant") {
      throw new GmailAuthError(
        "Google access has been revoked or expired. Please re-authenticate.",
        "GMAIL_TOKEN_REVOKED"
      );
    }

    throw new GmailAuthError(
      `Failed to refresh Google token (HTTP ${response.status})`,
      "GMAIL_TOKEN_REFRESH_FAILED"
    );
  }

  if (typeof data.access_token !== "string" || !data.access_token) {
    throw new GmailAuthError(
      "Google token endpoint response did not contain an access_token",
      "GMAIL_TOKEN_REFRESH_FAILED"
    );
  }

  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
  const newRefreshToken =
    typeof data.refresh_token === "string" && data.refresh_token.trim()
      ? data.refresh_token.trim()
      : undefined;

  return {
    accessToken: data.access_token,
    expiresIn,
    refreshToken: newRefreshToken,
  };
}

export interface GetAccessTokenOptions {
  prismaClient?: typeof defaultPrisma;
  fetchFn?: typeof fetch;
  tokenEndpoint?: string;
}

/**
 * Retrieves a valid Google access token for the given user, refreshing it if expired or near expiry.
 */
export async function getValidGoogleAccessToken(
  userId: string,
  options: GetAccessTokenOptions = {}
): Promise<string> {
  if (!userId || typeof userId !== "string") {
    throw new GmailAuthError("Invalid user ID", "GMAIL_INVALID_USER");
  }

  const prisma = options.prismaClient || defaultPrisma;

  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
      scope: true,
    },
  });

  if (!account) {
    throw new GmailAuthError(
      "No linked Google account found for this user",
      "GMAIL_NO_ACCOUNT"
    );
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const isExpiredOrNearExpiry =
    !account.access_token ||
    !account.expires_at ||
    account.expires_at - nowSeconds < TOKEN_EXPIRY_BUFFER_SECONDS;

  if (!isExpiredOrNearExpiry && account.access_token) {
    return account.access_token;
  }

  if (!account.refresh_token) {
    throw new GmailAuthError(
      "Google account is missing a refresh token. Please re-authenticate with Google.",
      "GMAIL_MISSING_REFRESH_TOKEN"
    );
  }

  const refreshed = await refreshGoogleAccessToken(account.refresh_token, {
    fetchFn: options.fetchFn,
    tokenEndpoint: options.tokenEndpoint,
  });

  const newExpiresAt = nowSeconds + refreshed.expiresIn;

  // Persist the new tokens. Never overwrite an existing refresh token with undefined.
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: refreshed.accessToken,
      expires_at: newExpiresAt,
      ...(refreshed.refreshToken ? { refresh_token: refreshed.refreshToken } : {}),
    },
  });

  return refreshed.accessToken;
}
