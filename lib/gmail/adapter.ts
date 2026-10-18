/**
 * Core normalization engine for Gmail API v1 responses.
 * Pure data transformation: takes raw Gmail API response objects and produces
 * normalized internal representations and Prisma model compatibility inputs.
 */

import {
  decodeBase64Url,
  formatEmailAddress,
  getHeaderValue,
  parseEmailAddressList,
} from "./decoder.ts";
import { MalformedPayloadError } from "./errors.ts";
import type {
  AttachmentMetadata,
  EmailAddress,
  GmailMessage,
  GmailMessageListResponse,
  GmailMessagePart,
  GmailThread,
  NormalizedEmail,
  NormalizedMessageList,
  NormalizedThread,
  PrismaEmailCreateInput,
  PrismaThreadCreateInput,
} from "./types.ts";

interface BodyAndAttachmentsResult {
  bodyText: string | null;
  bodyHtml: string | null;
  attachments: AttachmentMetadata[];
}

/**
 * Recursively inspects a Gmail MIME part tree to extract plain-text body,
 * HTML body, and attachment metadata.
 */
export function extractBodyAndAttachments(
  payload: GmailMessagePart | undefined | null
): BodyAndAttachmentsResult {
  const result: BodyAndAttachmentsResult = {
    bodyText: null,
    bodyHtml: null,
    attachments: [],
  };

  if (!payload) {
    return result;
  }

  const textParts: string[] = [];
  const htmlParts: string[] = [];

  function traverse(part: GmailMessagePart) {
    if (!part) return;

    const mimeType = (part.mimeType || "").toLowerCase();
    const filename = (part.filename || "").trim();
    const isAttachment =
      Boolean(filename) ||
      (part.body?.attachmentId !== undefined && part.body.attachmentId !== "");

    if (isAttachment && filename) {
      result.attachments.push({
        id: part.body?.attachmentId,
        filename,
        mimeType: part.mimeType || "application/octet-stream",
        size: part.body?.size || 0,
      });
      // Do not treat attachments as inline body text
      return;
    }

    // Body content extraction
    if (part.body?.data) {
      const decoded = decodeBase64Url(part.body.data);
      if (mimeType === "text/plain") {
        textParts.push(decoded);
      } else if (mimeType === "text/html") {
        htmlParts.push(decoded);
      }
    }

    // Recurse into nested MIME parts
    if (Array.isArray(part.parts) && part.parts.length > 0) {
      for (const childPart of part.parts) {
        traverse(childPart);
      }
    }
  }

  traverse(payload);

  const combinedText = textParts.join("\n\n").trim();
  const combinedHtml = htmlParts.join("").trim();
  result.bodyText = combinedText.length > 0 ? combinedText : null;
  result.bodyHtml = combinedHtml.length > 0 ? combinedHtml : null;

  return result;
}

/**
 * Parses received timestamp, giving precedence to Gmail's `internalDate` (ms epoch string),
 * falling back to the standard RFC 2822 `Date` header, and ultimately falling back to current date.
 */
export function parseReceivedAt(
  internalDate?: string | null,
  dateHeader?: string | null
): Date {
  if (internalDate && typeof internalDate === "string") {
    const epochMs = Number(internalDate);
    if (!Number.isNaN(epochMs) && epochMs > 0) {
      return new Date(epochMs);
    }
  }

  if (dateHeader && typeof dateHeader === "string") {
    const parsed = new Date(dateHeader);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

/**
 * Normalizes a raw Gmail API message resource (`gmail.users.messages.get`)
 * into our application's typed `NormalizedEmail`.
 */
export function normalizeGmailMessage(rawMessage: unknown): NormalizedEmail {
  if (!rawMessage || typeof rawMessage !== "object") {
    throw new MalformedPayloadError(
      "Invalid Gmail message payload: expected an object",
      rawMessage
    );
  }

  const msg = rawMessage as GmailMessage;

  if (!msg.id || typeof msg.id !== "string" || !msg.id.trim()) {
    throw new MalformedPayloadError(
      "Invalid Gmail message payload: missing required 'id'",
      rawMessage
    );
  }

  const gmailMessageId = msg.id.trim();
  const gmailThreadId =
    typeof msg.threadId === "string" && msg.threadId.trim()
      ? msg.threadId.trim()
      : gmailMessageId;

  const headers = msg.payload?.headers || [];

  // Extract core RFC 2822 headers
  const fromHeader = getHeaderValue(headers, "From");
  const toHeader = getHeaderValue(headers, "To");
  const ccHeader = getHeaderValue(headers, "Cc");
  const bccHeader = getHeaderValue(headers, "Bcc");
  const subjectHeader = getHeaderValue(headers, "Subject");
  const dateHeader = getHeaderValue(headers, "Date");
  const messageIdHeader =
    getHeaderValue(headers, "Message-ID") || getHeaderValue(headers, "Message-Id");

  // Parse addresses
  const parsedSenders = parseEmailAddressList(fromHeader);
  const sender: EmailAddress =
    parsedSenders.length > 0
      ? parsedSenders[0]
      : { address: "unknown@sender.invalid" };
  const senderFormatted = formatEmailAddress(sender);

  const recipients = parseEmailAddressList(toHeader);
  const cc = parseEmailAddressList(ccHeader);
  const bcc = parseEmailAddressList(bccHeader);

  // Extract body and attachments
  const { bodyText, bodyHtml, attachments } = extractBodyAndAttachments(msg.payload);

  // Parse timestamps
  const receivedAt = parseReceivedAt(msg.internalDate, dateHeader);

  // Normalize labels and metadata
  const labels = Array.isArray(msg.labelIds)
    ? msg.labelIds.filter((l): l is string => typeof l === "string")
    : [];

  const historyId =
    typeof msg.historyId === "string" && msg.historyId.trim()
      ? msg.historyId.trim()
      : null;

  const snippet =
    typeof msg.snippet === "string" && msg.snippet.trim()
      ? msg.snippet.trim()
      : null;

  return {
    gmailMessageId,
    gmailThreadId,
    sender,
    senderFormatted,
    recipients,
    cc,
    bcc,
    subject: subjectHeader !== null && subjectHeader !== undefined ? subjectHeader : null,
    snippet,
    bodyText,
    bodyHtml,
    receivedAt,
    receivedAtIso: receivedAt.toISOString(),
    internetMessageId: messageIdHeader,
    labels,
    historyId,
    attachments,
    rawSizeEstimate: typeof msg.sizeEstimate === "number" ? msg.sizeEstimate : undefined,
  };
}

/**
 * Normalizes a raw Gmail API thread resource (`gmail.users.threads.get`)
 * into our application's typed `NormalizedThread`.
 */
export function normalizeGmailThread(rawThread: unknown): NormalizedThread {
  if (!rawThread || typeof rawThread !== "object") {
    throw new MalformedPayloadError(
      "Invalid Gmail thread payload: expected an object",
      rawThread
    );
  }

  const thread = rawThread as GmailThread;

  if (!thread.id || typeof thread.id !== "string" || !thread.id.trim()) {
    throw new MalformedPayloadError(
      "Invalid Gmail thread payload: missing required 'id'",
      rawThread
    );
  }

  const gmailThreadId = thread.id.trim();
  const rawMessages = Array.isArray(thread.messages) ? thread.messages : [];

  const normalizedMessages: NormalizedEmail[] = [];
  for (const rawMsg of rawMessages) {
    try {
      normalizedMessages.push(normalizeGmailMessage(rawMsg));
    } catch (err) {
      // If one message is malformed, re-throw to alert the caller
      throw err;
    }
  }

  // Sort messages by received timestamp ascending
  normalizedMessages.sort(
    (a, b) => a.receivedAt.getTime() - b.receivedAt.getTime()
  );

  const latestMessage =
    normalizedMessages.length > 0
      ? normalizedMessages[normalizedMessages.length - 1]
      : null;

  const firstMessageWithSubject = normalizedMessages.find(
    (m) => m.subject !== null && m.subject.trim() !== ""
  );

  return {
    gmailThreadId,
    historyId:
      typeof thread.historyId === "string" && thread.historyId.trim()
        ? thread.historyId.trim()
        : null,
    messages: normalizedMessages,
    subject: firstMessageWithSubject?.subject || latestMessage?.subject || null,
    snippet: latestMessage?.snippet || null,
    lastReceivedAt: latestMessage?.receivedAt || new Date(),
  };
}

/**
 * Normalizes a Gmail API messages list response (`gmail.users.messages.list`)
 * extracting pagination tokens and message references.
 */
export function normalizeGmailMessageList(rawList: unknown): NormalizedMessageList {
  if (!rawList || typeof rawList !== "object") {
    throw new MalformedPayloadError(
      "Invalid Gmail message list payload: expected an object",
      rawList
    );
  }

  const list = rawList as GmailMessageListResponse;

  const messages: Array<{ id: string; threadId: string }> = [];

  if (Array.isArray(list.messages)) {
    for (const item of list.messages) {
      if (item && typeof item.id === "string" && typeof item.threadId === "string") {
        messages.push({
          id: item.id.trim(),
          threadId: item.threadId.trim(),
        });
      }
    }
  }

  return {
    messages,
    nextPageToken:
      typeof list.nextPageToken === "string" && list.nextPageToken.trim()
        ? list.nextPageToken.trim()
        : null,
    resultSizeEstimate:
      typeof list.resultSizeEstimate === "number" ? list.resultSizeEstimate : messages.length,
  };
}

// ============================================================================
// Prisma Compatibility Mappers
// ============================================================================

/**
 * Pure mapping function converting a NormalizedEmail into the exact shape
 * required for Prisma `Email` model insertion.
 *
 * @param normalized - Normalized email output from `normalizeGmailMessage`
 * @param userId - Target user ID (cuid)
 * @param internalThreadId - Target internal Thread ID (cuid) in OneMail DB
 */
export function toPrismaEmailInput(
  normalized: NormalizedEmail,
  userId: string,
  internalThreadId: string
): PrismaEmailCreateInput {
  if (!userId || typeof userId !== "string") {
    throw new Error("Cannot map to Prisma Email input: 'userId' is required");
  }
  if (!internalThreadId || typeof internalThreadId !== "string") {
    throw new Error("Cannot map to Prisma Email input: 'internalThreadId' is required");
  }

  return {
    userId,
    threadId: internalThreadId,
    gmailMessageId: normalized.gmailMessageId,
    gmailThreadId: normalized.gmailThreadId,
    sender: normalized.senderFormatted,
    recipients: normalized.recipients,
    cc: normalized.cc,
    bcc: normalized.bcc,
    subject: normalized.subject,
    snippet: normalized.snippet,
    bodyText: normalized.bodyText,
    bodyHtml: normalized.bodyHtml,
    receivedAt: normalized.receivedAt,
  };
}

/**
 * Pure mapping function converting a NormalizedThread or NormalizedEmail into
 * the exact shape required for Prisma `Thread` model insertion.
 *
 * @param threadOrEmail - Normalized thread or email
 * @param userId - Target user ID (cuid)
 */
export function toPrismaThreadInput(
  threadOrEmail: NormalizedThread | NormalizedEmail,
  userId: string
): PrismaThreadCreateInput {
  if (!userId || typeof userId !== "string") {
    throw new Error("Cannot map to Prisma Thread input: 'userId' is required");
  }

  return {
    userId,
    gmailThreadId: threadOrEmail.gmailThreadId,
    subject: threadOrEmail.subject,
    snippet: threadOrEmail.snippet,
  };
}
