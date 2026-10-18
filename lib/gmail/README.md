# OneMail — Gmail Ingestion Data Adapter

The `lib/gmail` module provides a pure, typed, and independently testable normalization layer for Gmail API v1 responses. It converts raw Gmail API message, thread, and list payloads into OneMail's normalized internal representations and Prisma model compatibility inputs without calling the Gmail API or database directly.

---

## 1. Module Overview

| File | Purpose |
| :--- | :--- |
| `types.ts` | Typed representations of raw Gmail API responses, internal normalized email/thread models, and Prisma DTOs. |
| `decoder.ts` | Pure utilities for URL-safe Base64 decoding, RFC 2047 MIME encoded-word header decoding, and address list parsing. |
| `errors.ts` | Typed error hierarchy (`GmailAdapterError`, `MalformedPayloadError`, `DecodeError`). |
| `adapter.ts` | Normalization functions (`normalizeGmailMessage`, `normalizeGmailThread`, `normalizeGmailMessageList`) and Prisma mappers (`toPrismaEmailInput`, `toPrismaThreadInput`). |
| `index.ts` | Public API barrel export. |
| `__tests__/` | 10 realistic JSON fixtures and automated test suite using Node's built-in `node:test` runner. |

---

## 2. Input / Output Contract

### `normalizeGmailMessage(rawMessage: unknown): NormalizedEmail`
- **Input**: Raw Gmail message resource (`gmail.users.messages.get` with `format: "full"`).
- **Output**:
  ```ts
  interface NormalizedEmail {
    gmailMessageId: string;
    gmailThreadId: string;
    sender: { name?: string; address: string };
    senderFormatted: string; // "Jane Doe <jane@example.com>"
    recipients: Array<{ name?: string; address: string }>;
    cc: Array<{ name?: string; address: string }>;
    bcc: Array<{ name?: string; address: string }>;
    subject: string | null;
    snippet: string | null;
    bodyText: string | null;
    bodyHtml: string | null;
    receivedAt: Date;
    receivedAtIso: string;
    internetMessageId: string | null;
    labels: string[];
    historyId: string | null;
    attachments: Array<{ id?: string; filename: string; mimeType: string; size: number }>;
    rawSizeEstimate?: number;
  }
  ```

### `normalizeGmailThread(rawThread: unknown): NormalizedThread`
- **Input**: Raw Gmail thread resource (`gmail.users.threads.get`).
- **Output**:
  ```ts
  interface NormalizedThread {
    gmailThreadId: string;
    historyId: string | null;
    messages: NormalizedEmail[]; // Chronologically sorted by receivedAt ascending
    subject: string | null;
    snippet: string | null;
    lastReceivedAt: Date;
  }
  ```

### `normalizeGmailMessageList(rawList: unknown): NormalizedMessageList`
- **Input**: Raw list messages response (`gmail.users.messages.list`).
- **Output**:
  ```ts
  interface NormalizedMessageList {
    messages: Array<{ id: string; threadId: string }>;
    nextPageToken: string | null;
    resultSizeEstimate: number;
  }
  ```

### `toPrismaEmailInput(normalized, userId, internalThreadId): PrismaEmailCreateInput`
- Maps normalized email directly to the fields required by `prisma.email.create` or `prisma.email.upsert`.

### `toPrismaThreadInput(threadOrEmail, userId): PrismaThreadCreateInput`
- Maps normalized thread or email to the fields required by `prisma.thread.create` or `prisma.thread.upsert`.

---

## 3. Model Compatibility & Documented Mismatches

The adapter maps cleanly to the current `prisma/schema.prisma` without altering the schema or database:

| Gmail / Adapter Field | Prisma Schema Mapping | Schema Considerations |
| :--- | :--- | :--- |
| `gmailMessageId` | `Email.gmailMessageId` | 1:1 mapping |
| `gmailThreadId` | `Email.gmailThreadId`, `Thread.gmailThreadId` | 1:1 mapping |
| `senderFormatted` | `Email.sender` (String) | Stored as formatted string `"Name <addr>"` or `"<addr>"` |
| `recipients` | `Email.recipients` (Json?) | Stored as structured array `[{ name?, address }]` |
| `cc`, `bcc` | `Email.cc`, `Email.bcc` (Json?) | Stored as structured JSON array |
| `receivedAt` | `Email.receivedAt` (DateTime) | Extracted from `internalDate` or RFC 2822 `Date` header |
| `labels` (`labelIds`) | *None in `Email`* | **Mismatch**: The `Email` model has no `labels` column. Labels are kept in `NormalizedEmail` for ingestion filtering (e.g., skip `SPAM`, filter `INBOX`, detect `UNREAD`). |
| `historyId` | `SyncState.historyId` | **Mismatch**: Belongs on the user's `SyncState` record for incremental mailbox syncing, not on individual `Email` records. |
| `attachments` | *None in `Email`* | **Mismatch**: No `Attachment` table exists in `schema.prisma`. Metadata is captured in `NormalizedEmail` for future storage integration. |
| `internetMessageId` | *None in `Email`* | RFC 822 `Message-ID` header; distinct from Gmail's internal hex ID. |
| `userId`, `threadId` (FK) | Relational Foreign Keys | Must be supplied by the ingestion orchestrator (not part of Gmail API response). |

---

## 4. How Google OAuth & Ingestion Will Consume This Adapter

When the background ingestion worker is connected:

1. **Token Retrieval**: The worker retrieves the user's Google OAuth refresh token from `Account` in Prisma and requests an access token.
2. **List Messages**:
   ```ts
   const rawList = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?...');
   const { messages, nextPageToken } = normalizeGmailMessageList(await rawList.json());
   ```
3. **Fetch & Normalize Individual Messages**:
   ```ts
   for (const { id } of messages) {
     const rawMsg = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`);
     const normalized = normalizeGmailMessage(await rawMsg.json());

     // Upsert Thread
     const thread = await prisma.thread.upsert({
       where: { userId_gmailThreadId: { userId, gmailThreadId: normalized.gmailThreadId } },
       create: toPrismaThreadInput(normalized, userId),
       update: { snippet: normalized.snippet },
     });

     // Upsert Email
     await prisma.email.upsert({
       where: { userId_gmailMessageId: { userId, gmailMessageId: normalized.gmailMessageId } },
       create: toPrismaEmailInput(normalized, userId, thread.id),
       update: {},
     });
   }
   ```
4. **Update Sync State**:
   ```ts
   if (latestHistoryId) {
     await prisma.syncState.upsert({
       where: { userId },
       create: { userId, historyId: latestHistoryId, lastSyncedAt: new Date() },
       update: { historyId: latestHistoryId, lastSyncedAt: new Date() },
     });
   }
   ```

---

## 5. Running Tests

Tests run using Node.js 24's native `--experimental-strip-types` and built-in `node:test` runner without any external test frameworks:

```bash
npm test
```
