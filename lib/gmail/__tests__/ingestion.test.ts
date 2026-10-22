/**
 * Comprehensive Automated Tests for Secure Gmail Ingestion.
 *
 * Covers:
 * 1. Token refresh success & failure handling (with mocked Google OAuth endpoints)
 * 2. Gmail API client failure & rate-limit handling
 * 3. Normalization through the existing adapter
 * 4. Duplicate message handling and user isolation
 * 5. Persistence behavior for new and existing messages
 * 6. Secret and token leak prevention in results and errors
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  fetchGmailMessage,
  fetchRecentMessageList,
  getValidGoogleAccessToken,
  type GetAccessTokenOptions,
  GmailApiError,
  GmailAuthError,
  ingestRecentMessages,
  refreshGoogleAccessToken,
} from "../index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadFixture<T = Record<string, unknown>>(filename: string): T {
  const filePath = path.join(__dirname, "fixtures", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

describe("Gmail Ingestion — Token Refresh & Security", () => {
  it("1. successfully refreshes access token using Google token endpoint", async () => {
    const mockFetch = (async (url: string | URL | Request, init?: RequestInit) => {
      assert.equal(url.toString(), "https://oauth2.googleapis.com/token");
      assert.equal(init?.method, "POST");
      const body = new URLSearchParams(init?.body as string);
      assert.equal(body.get("grant_type"), "refresh_token");
      assert.equal(body.get("refresh_token"), "valid-mock-refresh-token");
      assert.equal(body.get("client_id"), "test-client-id");
      assert.equal(body.get("client_secret"), "test-client-secret");

      return new Response(
        JSON.stringify({
          access_token: "new-mock-access-token-12345",
          expires_in: 3600,
          token_type: "Bearer",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }) as typeof fetch;

    const result = await refreshGoogleAccessToken("valid-mock-refresh-token", {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      fetchFn: mockFetch,
    });

    assert.equal(result.accessToken, "new-mock-access-token-12345");
    assert.equal(result.expiresIn, 3600);
    assert.equal(result.refreshToken, undefined);
  });

  it("2. throws GMAIL_TOKEN_REVOKED on Google invalid_grant error", async () => {
    const mockFetch = (async () => {
      return new Response(
        JSON.stringify({
          error: "invalid_grant",
          error_description: "Token has been expired or revoked.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }) as typeof fetch;

    await assert.rejects(
      async () => {
        await refreshGoogleAccessToken("revoked-token", {
          clientId: "test-client-id",
          clientSecret: "test-client-secret",
          fetchFn: mockFetch,
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof GmailAuthError);
        assert.equal(err.code, "GMAIL_TOKEN_REVOKED");
        assert.match(err.message, /revoked or expired/i);
        return true;
      }
    );
  });

  it("3. throws GMAIL_MISSING_REFRESH_TOKEN when refresh token is empty", async () => {
    await assert.rejects(
      async () => {
        await refreshGoogleAccessToken("", {
          clientId: "test-client-id",
          clientSecret: "test-client-secret",
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof GmailAuthError);
        assert.equal(err.code, "GMAIL_MISSING_REFRESH_TOKEN");
        return true;
      }
    );
  });

  it("4. returns cached access token when existing token has not expired", async () => {
    const futureExpiry = Math.floor(Date.now() / 1000) + 1800; // 30 minutes in future
    const mockPrisma = {
      account: {
        findFirst: async () => ({
          id: "account-cuid-1",
          userId: "user-1",
          access_token: "cached-valid-access-token",
          refresh_token: "mock-refresh-token",
          expires_at: futureExpiry,
          scope: "https://www.googleapis.com/auth/gmail.readonly",
        }),
        update: async () => {
          throw new Error("Update should not be called when token is valid");
        },
      },
    } as unknown as GetAccessTokenOptions["prismaClient"];

    const token = await getValidGoogleAccessToken("user-1", {
      prismaClient: mockPrisma,
    });

    assert.equal(token, "cached-valid-access-token");
  });

  it("5. automatically refreshes and persists when token is near expiry", async () => {
    const nearExpiry = Math.floor(Date.now() / 1000) + 60; // Only 1 minute left (< 5 min buffer)
    let updatedAccountData: Record<string, unknown> | null = null;

    const mockPrisma = {
      account: {
        findFirst: async () => ({
          id: "account-cuid-1",
          userId: "user-1",
          access_token: "near-expiry-token",
          refresh_token: "refresh-token-xyz",
          expires_at: nearExpiry,
          scope: "https://www.googleapis.com/auth/gmail.readonly",
        }),
        update: async ({ data }: { data: Record<string, unknown> }) => {
          updatedAccountData = data;
          return { id: "account-cuid-1", ...data };
        },
      },
    } as unknown as GetAccessTokenOptions["prismaClient"];

    const mockFetch = (async () => {
      return new Response(
        JSON.stringify({
          access_token: "refreshed-fresh-token-999",
          expires_in: 3600,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }) as typeof fetch;

    const token = await getValidGoogleAccessToken("user-1", {
      prismaClient: mockPrisma,
      fetchFn: mockFetch,
    });

    assert.equal(token, "refreshed-fresh-token-999");
    assert.ok(updatedAccountData);
    assert.equal(
      (updatedAccountData as { access_token: string }).access_token,
      "refreshed-fresh-token-999"
    );
  });

  it("6. throws GMAIL_NO_ACCOUNT if user has no linked Google account", async () => {
    const mockPrisma = {
      account: {
        findFirst: async () => null,
      },
    } as unknown as GetAccessTokenOptions["prismaClient"];

    await assert.rejects(
      async () => {
        await getValidGoogleAccessToken("user-unlinked", {
          prismaClient: mockPrisma,
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof GmailAuthError);
        assert.equal(err.code, "GMAIL_NO_ACCOUNT");
        return true;
      }
    );
  });
});

describe("Gmail Ingestion — API Client Error Handling", () => {
  it("7. handles 401 Unauthorized from Gmail API", async () => {
    const mockFetch = (async () => {
      return new Response(JSON.stringify({ error: { message: "Invalid Credentials" } }), {
        status: 401,
      });
    }) as typeof fetch;

    await assert.rejects(
      async () => {
        await fetchRecentMessageList("bad-token", 20, { fetchFn: mockFetch });
      },
      (err: unknown) => {
        assert.ok(err instanceof GmailApiError);
        assert.equal(err.status, 401);
        return true;
      }
    );
  });

  it("8. handles 403 Forbidden (insufficient scopes) from Gmail API", async () => {
    const mockFetch = (async () => {
      return new Response(JSON.stringify({ error: { message: "Insufficient Permission", errors: [{ reason: "insufficientPermissions" }] } }), {
        status: 403,
      });
    }) as typeof fetch;

    await assert.rejects(
      async () => {
        await fetchGmailMessage("token-without-scope", "msg-123", { fetchFn: mockFetch });
      },
      (err: unknown) => {
        assert.ok(err instanceof GmailApiError);
        assert.equal(err.status, 403);
        assert.match(err.message, /Insufficient Permission/i);
        return true;
      }
    );
  });

  it("8b. handles 403 Forbidden (accessNotConfigured / API not enabled) from Gmail API", async () => {
    const mockFetch = (async () => {
      return new Response(
        JSON.stringify({
          error: {
            code: 403,
            message: "Gmail API has not been used in project 1096002093089 before or it is disabled.",
            errors: [{ reason: "accessNotConfigured" }],
          },
        }),
        { status: 403 }
      );
    }) as typeof fetch;

    await assert.rejects(
      async () => {
        await fetchRecentMessageList("valid-token", 20, { fetchFn: mockFetch });
      },
      (err: unknown) => {
        assert.ok(err instanceof GmailApiError);
        assert.equal(err.status, 403);
        assert.match(err.message, /Gmail API has not been used in project/i);
        return true;
      }
    );
  });

  it("9. handles 429 Rate Limit from Gmail API", async () => {
    const mockFetch = (async () => {
      return new Response(JSON.stringify({ error: { message: "User Rate Limit Exceeded" } }), {
        status: 429,
      });
    }) as typeof fetch;

    await assert.rejects(
      async () => {
        await fetchRecentMessageList("valid-token", 20, { fetchFn: mockFetch });
      },
      (err: unknown) => {
        assert.ok(err instanceof GmailApiError);
        assert.equal(err.status, 429);
        return true;
      }
    );
  });
});

describe("Gmail Ingestion — End-to-End Persistence & Isolation", () => {
  it("10. ingests messages idempotently, normalizes them, and prevents duplicates", async () => {
    const msg01 = loadFixture("01-plain-text.json");
    const msg02 = loadFixture("02-html-only.json");

    // Mock in-memory database storage
    const inMemoryThreads: Map<string, Record<string, unknown>> = new Map();
    const inMemoryEmails: Map<string, Record<string, unknown>> = new Map();
    let syncStateRecord: Record<string, unknown> | null = null;

    const mockPrisma = {
      thread: {
        upsert: async ({
          where,
          create,
          update,
        }: {
          where: { userId_gmailThreadId: { userId: string; gmailThreadId: string } };
          create: Record<string, unknown>;
          update: Record<string, unknown>;
        }) => {
          const key = `${where.userId_gmailThreadId.userId}:${where.userId_gmailThreadId.gmailThreadId}`;
          if (inMemoryThreads.has(key)) {
            const existing = inMemoryThreads.get(key)!;
            const updated = { ...existing, ...update };
            inMemoryThreads.set(key, updated);
            return updated;
          }
          const record = { id: `thread-${inMemoryThreads.size + 1}`, ...create };
          inMemoryThreads.set(key, record);
          return record;
        },
      },
      email: {
        findUnique: async ({
          where,
        }: {
          where: { userId_gmailMessageId: { userId: string; gmailMessageId: string } };
        }) => {
          const key = `${where.userId_gmailMessageId.userId}:${where.userId_gmailMessageId.gmailMessageId}`;
          return inMemoryEmails.get(key) || null;
        },
        create: async ({ data }: { data: Record<string, unknown> }) => {
          const key = `${data.userId}:${data.gmailMessageId}`;
          const record = { id: `email-${inMemoryEmails.size + 1}`, ...data };
          inMemoryEmails.set(key, record);
          return record;
        },
        update: async ({
          where,
          data,
        }: {
          where: { id: string };
          data: Record<string, unknown>;
        }) => {
          for (const [key, record] of inMemoryEmails.entries()) {
            if (record.id === where.id) {
              const updated = { ...record, ...data };
              inMemoryEmails.set(key, updated);
              return updated;
            }
          }
          throw new Error("Email not found");
        },
      },
      syncState: {
        upsert: async ({
          where,
          create,
          update,
        }: {
          where: { userId: string };
          create: Record<string, unknown>;
          update: Record<string, unknown>;
        }) => {
          syncStateRecord = { userId: where.userId, ...create, ...update };
          return syncStateRecord;
        },
      },
    } as unknown as Parameters<typeof ingestRecentMessages>[0]["prismaClient"];

    // Mock Gmail API fetch responses
    const mockFetch = (async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("/messages?maxResults=")) {
        return new Response(
          JSON.stringify({
            messages: [
              { id: "1894a8f9c1000001", threadId: "1894a8f9c1000001" },
              { id: "1894a8f9c1000002", threadId: "1894a8f9c1000002" },
            ],
            resultSizeEstimate: 2,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (urlStr.includes("1894a8f9c1000001")) {
        return new Response(JSON.stringify(msg01), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (urlStr.includes("1894a8f9c1000002")) {
        return new Response(JSON.stringify(msg02), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
    }) as typeof fetch;

    // First run: should create 2 emails and 2 threads
    const run1 = await ingestRecentMessages({
      userId: "user-alpha",
      accessToken: "mock-valid-access-token",
      prismaClient: mockPrisma,
      fetchFn: mockFetch,
    });

    assert.equal(run1.success, true);
    assert.equal(run1.fetched, 2);
    assert.equal(run1.created, 2);
    assert.equal(run1.updated, 0);
    assert.equal(run1.failed, 0);
    assert.equal(inMemoryEmails.size, 2);
    assert.equal(inMemoryThreads.size, 2);

    // Second run with same messages: should update 2 emails and not duplicate
    const run2 = await ingestRecentMessages({
      userId: "user-alpha",
      accessToken: "mock-valid-access-token",
      prismaClient: mockPrisma,
      fetchFn: mockFetch,
    });

    assert.equal(run2.success, true);
    assert.equal(run2.fetched, 2);
    assert.equal(run2.created, 0);
    assert.equal(run2.updated, 2);
    assert.equal(run2.failed, 0);
    // Size MUST remain 2 (no duplicates created!)
    assert.equal(inMemoryEmails.size, 2);
    assert.equal(inMemoryThreads.size, 2);

    // User isolation check: user-beta sync should create records under user-beta, not touching user-alpha
    const runBeta = await ingestRecentMessages({
      userId: "user-beta",
      accessToken: "mock-valid-access-token",
      prismaClient: mockPrisma,
      fetchFn: mockFetch,
    });

    assert.equal(runBeta.created, 2);
    // user-beta has its own separate keys
    assert.equal(inMemoryEmails.size, 4);
    assert.ok(inMemoryEmails.has("user-alpha:1894a8f9c1000001"));
    assert.ok(inMemoryEmails.has("user-beta:1894a8f9c1000001"));
  });

  it("11. never leaks tokens, secrets, or full message bodies in IngestResult", async () => {
    const msg01 = loadFixture("01-plain-text.json");

    const mockPrisma = {
      thread: {
        upsert: async () => ({ id: "thread-1" }),
      },
      email: {
        findUnique: async () => null,
        create: async () => ({ id: "email-1" }),
      },
      syncState: {
        upsert: async () => ({}),
      },
    } as unknown as Parameters<typeof ingestRecentMessages>[0]["prismaClient"];

    const mockFetch = (async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("/messages?maxResults=")) {
        return new Response(
          JSON.stringify({
            messages: [{ id: "1894a8f9c1000001", threadId: "1894a8f9c1000001" }],
          }),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify(msg01), { status: 200 });
    }) as typeof fetch;

    const result = await ingestRecentMessages({
      userId: "user-secret-test",
      accessToken: "super-secret-google-access-token-987",
      prismaClient: mockPrisma,
      fetchFn: mockFetch,
    });

    const serialized = JSON.stringify(result);

    // Tokens must never appear in result
    assert.equal(serialized.includes("super-secret-google-access-token-987"), false);
    // Email bodies must not appear in summary
    assert.equal(serialized.includes("Hello OneMail team"), false);
    assert.equal(serialized.includes("bodyText"), false);
    assert.equal(serialized.includes("bodyHtml"), false);

    // Only expected counts are present
    assert.deepEqual(Object.keys(result).sort(), ["created", "failed", "fetched", "success", "updated"]);
  });
});
