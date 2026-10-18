/**
 * Comprehensive automated test suite for the Gmail Ingestion Data Adapter.
 * Uses Node.js native test runner (node:test) and strict assertions (node:assert/strict).
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  MalformedPayloadError,
  normalizeGmailMessage,
  normalizeGmailMessageList,
  normalizeGmailThread,
  parseReceivedAt,
  toPrismaEmailInput,
  toPrismaThreadInput,
} from "../index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadFixture<T = Record<string, unknown>>(filename: string): T {
  const filePath = path.join(__dirname, "fixtures", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

describe("OneMail Gmail Ingestion Data Adapter", () => {
  // --------------------------------------------------------------------------
  // Scenario 1: Normal Plain-Text Email
  // --------------------------------------------------------------------------
  it("1. normalizes a standard plain-text email", () => {
    const raw = loadFixture("01-plain-text.json");
    const email = normalizeGmailMessage(raw);

    assert.equal(email.gmailMessageId, "1894a8f9c1000001");
    assert.equal(email.gmailThreadId, "1894a8f9c1000001");
    assert.equal(email.sender.address, "alice@example.com");
    assert.equal(email.sender.name, "Alice Smith");
    assert.equal(email.senderFormatted, "Alice Smith <alice@example.com>");
    assert.equal(email.recipients.length, 1);
    assert.equal(email.recipients[0].address, "bob@example.com");
    assert.equal(email.subject, "Quarterly Planning Meeting");
    assert.match(email.bodyText || "", /Hello OneMail team/);
    assert.equal(email.bodyHtml, null);
    assert.equal(email.internetMessageId, "<msg-001@mail.example.com>");
    assert.deepEqual(email.labels, ["INBOX", "IMPORTANT", "CATEGORY_PERSONAL"]);
    assert.equal(email.receivedAt.getTime(), 1729272000000);

    // Test Prisma mapping
    const prismaEmail = toPrismaEmailInput(email, "user-cuid-123", "thread-cuid-456");
    assert.equal(prismaEmail.userId, "user-cuid-123");
    assert.equal(prismaEmail.threadId, "thread-cuid-456");
    assert.equal(prismaEmail.gmailMessageId, "1894a8f9c1000001");
    assert.equal(prismaEmail.sender, "Alice Smith <alice@example.com>");
    assert.equal(prismaEmail.subject, "Quarterly Planning Meeting");
  });

  // --------------------------------------------------------------------------
  // Scenario 2: HTML Email
  // --------------------------------------------------------------------------
  it("2. normalizes an HTML-only email", () => {
    const raw = loadFixture("02-html-only.json");
    const email = normalizeGmailMessage(raw);

    assert.equal(email.gmailMessageId, "1894a8f9c1000002");
    assert.equal(email.bodyText, null);
    assert.ok(email.bodyHtml);
    assert.match(email.bodyHtml, /<h1>Weekly Project Update<\/h1>/);
    assert.equal(email.sender.name, "Newsletter");
    assert.equal(email.sender.address, "news@company.org");
    assert.equal(email.receivedAt.getTime(), 1729275600000);
  });

  // --------------------------------------------------------------------------
  // Scenario 3: Multipart Email (multipart/alternative)
  // --------------------------------------------------------------------------
  it("3. extracts both plain text and HTML from multipart/alternative emails", () => {
    const raw = loadFixture("03-multipart-alternative.json");
    const email = normalizeGmailMessage(raw);

    assert.equal(email.gmailMessageId, "1894a8f9c1000003");
    assert.ok(email.bodyText);
    assert.ok(email.bodyHtml);
    assert.match(email.bodyText, /Action Required: Complete your profile verification/);
    assert.match(email.bodyHtml, /<strong>Action Required:<\/strong>/);
    assert.equal(email.cc.length, 1);
    assert.equal(email.cc[0].address, "compliance@auth.com");
  });

  // --------------------------------------------------------------------------
  // Scenario 4: Missing Optional Headers
  // --------------------------------------------------------------------------
  it("4. handles missing optional headers (Subject, Date, Cc, Bcc, Message-ID)", () => {
    const raw = loadFixture("04-missing-headers.json");
    const email = normalizeGmailMessage(raw);

    assert.equal(email.gmailMessageId, "1894a8f9c1000004");
    assert.equal(email.subject, null);
    assert.equal(email.internetMessageId, null);
    assert.deepEqual(email.cc, []);
    assert.deepEqual(email.bcc, []);
    assert.equal(email.sender.address, "coworker@company.com");
    assert.equal(email.sender.name, undefined);
    assert.equal(email.receivedAt.getTime(), 1729282800000);
  });

  // --------------------------------------------------------------------------
  // Scenario 5: Encoded Subjects and Sender Names (RFC 2047)
  // --------------------------------------------------------------------------
  it("5. decodes RFC 2047 Base64 and Quoted-Printable encoded header words", () => {
    const raw = loadFixture("05-encoded-words.json");
    const email = normalizeGmailMessage(raw);

    assert.equal(email.sender.name, "Jérôme Dupont");
    assert.equal(email.sender.address, "jerome@example.fr");
    assert.equal(email.senderFormatted, "Jérôme Dupont <jerome@example.fr>");
    assert.equal(email.subject, "Café Rencontre - Confirmation");
  });

  // --------------------------------------------------------------------------
  // Scenario 6: Nested MIME Parts
  // --------------------------------------------------------------------------
  it("6. recursively walks nested MIME trees (mixed -> related -> alternative)", () => {
    const raw = loadFixture("06-nested-mime-parts.json");
    const email = normalizeGmailMessage(raw);

    assert.ok(email.bodyText);
    assert.match(email.bodyText, /Please find your invoice documents attached/);
    assert.ok(email.bodyHtml);
    assert.match(email.bodyHtml, /<b>invoice documents<\/b>/);

    // Verifies 2 attachments were captured correctly
    assert.equal(email.attachments.length, 2);
    const [logo, pdf] = email.attachments;
    assert.equal(logo.filename, "logo.png");
    assert.equal(logo.mimeType, "image/png");
    assert.equal(logo.id, "att-logo-1");
    assert.equal(pdf.filename, "invoice_8920.pdf");
    assert.equal(pdf.mimeType, "application/pdf");
    assert.equal(pdf.id, "att-pdf-2");
  });

  // --------------------------------------------------------------------------
  // Scenario 7: Empty or Malformed Payloads
  // --------------------------------------------------------------------------
  it("7. gracefully handles and rejects malformed payloads with typed errors", () => {
    const fixtures = loadFixture("07-malformed-payload.json");

    // Missing required ID throws MalformedPayloadError
    assert.throws(
      () => normalizeGmailMessage(fixtures.missingId),
      (err: unknown) =>
        err instanceof MalformedPayloadError && /missing required 'id'/.test(err.message)
    );

    // Empty object throws MalformedPayloadError
    assert.throws(
      () => normalizeGmailMessage(fixtures.emptyObject),
      (err: unknown) => err instanceof MalformedPayloadError
    );

    // Null throws MalformedPayloadError
    assert.throws(
      () => normalizeGmailMessage(fixtures.nullPayload),
      (err: unknown) => err instanceof MalformedPayloadError
    );

    // Corrupted Base64 does not crash, falls back safely to empty text
    const corrupted = normalizeGmailMessage(fixtures.corruptedBase64);
    assert.equal(corrupted.gmailMessageId, "1894a8f9c1000007b");
    assert.equal(corrupted.bodyText, null);
  });

  // --------------------------------------------------------------------------
  // Scenario 8: Multiple Recipients, CC and BCC
  // --------------------------------------------------------------------------
  it("8. parses multiple recipients with complex quoted names across To, Cc, Bcc", () => {
    const raw = loadFixture("08-multiple-recipients.json");
    const email = normalizeGmailMessage(raw);

    // Sender
    assert.equal(email.sender.name, "Doe, Jane");
    assert.equal(email.sender.address, "jane.doe@corp.com");
    assert.equal(email.senderFormatted, "Doe, Jane <jane.doe@corp.com>");

    // To
    assert.equal(email.recipients.length, 3);
    assert.deepEqual(email.recipients[0], { name: "Alice Smith", address: "alice@example.com" });
    assert.deepEqual(email.recipients[1], { name: "Bob Jones, Jr.", address: "bob.jones@corp.com" });
    assert.deepEqual(email.recipients[2], { address: "direct@partner.org" });

    // Cc
    assert.equal(email.cc.length, 2);
    assert.deepEqual(email.cc[0], { address: "lead@corp.com" });
    assert.deepEqual(email.cc[1], { name: "Smith, John", address: "john.smith@domain.com" });

    // Bcc
    assert.equal(email.bcc.length, 2);
    assert.deepEqual(email.bcc[0], { address: "audit-archive@corp.com" });
    assert.deepEqual(email.bcc[1], { address: "legal@corp.com" });
  });

  // --------------------------------------------------------------------------
  // Scenario 9: Missing Body Content or Attachments
  // --------------------------------------------------------------------------
  it("9. isolates attachment metadata and preserves body content", () => {
    const raw = loadFixture("09-attachments-metadata.json");
    const email = normalizeGmailMessage(raw);

    assert.ok(email.bodyText);
    assert.match(email.bodyText, /Attached are the quarterly report/);
    assert.equal(email.attachments.length, 2);
    assert.equal(email.attachments[0].filename, "Q3_Report_2026.pdf");
    assert.equal(email.attachments[0].size, 1048576);
    assert.equal(email.attachments[1].filename, "chart_metrics.jpg");
    assert.equal(email.attachments[1].size, 420800);
  });

  // --------------------------------------------------------------------------
  // Scenario 10: Timestamp Conversion, Pagination, and Threads
  // --------------------------------------------------------------------------
  it("10. normalizes pagination metadata and handles timestamp fallback", () => {
    const rawPagination = loadFixture("10-pagination.json");
    const list = normalizeGmailMessageList(rawPagination);

    assert.equal(list.messages.length, 5);
    assert.equal(list.nextPageToken, "PAGE_TOKEN_ABC123XYZ");
    assert.equal(list.resultSizeEstimate, 142);

    // Timestamp priority check
    const fromEpoch = parseReceivedAt("1700000000000", "Fri, 18 Oct 2026 12:00:00 +0000");
    assert.equal(fromEpoch.getTime(), 1700000000000);

    const fromDateHeader = parseReceivedAt(null, "Fri, 18 Oct 2026 12:00:00 +0000");
    assert.equal(fromDateHeader.toISOString(), "2026-10-18T12:00:00.000Z");

    const fallbackNow = parseReceivedAt(null, null);
    assert.ok(fallbackNow instanceof Date);
    assert.ok(Date.now() - fallbackNow.getTime() < 5000);
  });

  it("normalizes a full Gmail thread with sorted messages and Prisma thread input", () => {
    const msg1 = loadFixture("01-plain-text.json");
    const msg2 = loadFixture("03-multipart-alternative.json");
    msg2.threadId = msg1.threadId; // Associate to same thread

    const rawThread = {
      id: msg1.threadId,
      historyId: "998877",
      messages: [msg2, msg1], // Intentionally unordered
    };

    const thread = normalizeGmailThread(rawThread);
    assert.equal(thread.gmailThreadId, msg1.threadId);
    assert.equal(thread.historyId, "998877");
    assert.equal(thread.messages.length, 2);
    // Messages must be sorted chronologically
    assert.ok(thread.messages[0].receivedAt.getTime() <= thread.messages[1].receivedAt.getTime());
    assert.equal(thread.subject, "Quarterly Planning Meeting");

    const prismaThread = toPrismaThreadInput(thread, "user-cuid-999");
    assert.equal(prismaThread.userId, "user-cuid-999");
    assert.equal(prismaThread.gmailThreadId, msg1.threadId);
    assert.equal(prismaThread.subject, "Quarterly Planning Meeting");
  });
});
