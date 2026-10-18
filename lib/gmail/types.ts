/**
 * TypeScript definitions for Gmail API v1 responses,
 * normalized internal email representations, and Prisma model compatibility DTOs.
 */

// ============================================================================
// Gmail API v1 Raw Data Types
// ============================================================================

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessagePartBody {
  attachmentId?: string;
  size?: number;
  data?: string; // Base64URL-encoded string
}

export interface GmailMessagePart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: GmailMessagePartBody;
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id?: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string; // Epoch timestamp in milliseconds as string
  sizeEstimate?: number;
  raw?: string;
  payload?: GmailMessagePart;
}

export interface GmailThread {
  id?: string;
  historyId?: string;
  messages?: GmailMessage[];
}

export interface GmailMessageListResponse {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

// ============================================================================
// Normalized Internal Data Types
// ============================================================================

export interface EmailAddress {
  name?: string;
  address: string;
}

export interface AttachmentMetadata {
  id?: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface NormalizedEmail {
  gmailMessageId: string;
  gmailThreadId: string;
  sender: EmailAddress;
  senderFormatted: string;
  recipients: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  subject: string | null;
  snippet: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  receivedAt: Date;
  receivedAtIso: string;
  internetMessageId: string | null;
  labels: string[];
  historyId: string | null;
  attachments: AttachmentMetadata[];
  rawSizeEstimate?: number;
}

export interface NormalizedThread {
  gmailThreadId: string;
  historyId: string | null;
  messages: NormalizedEmail[];
  subject: string | null;
  snippet: string | null;
  lastReceivedAt: Date;
}

export interface NormalizedMessageList {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken: string | null;
  resultSizeEstimate: number;
}

// ============================================================================
// Prisma Model Compatibility DTOs
// ============================================================================

/**
 * Clean data transfer object matching the existing Prisma `Email` model columns.
 * Relational IDs (`userId`, internal `threadId`) must be supplied by the ingestion caller.
 */
export interface PrismaEmailCreateInput {
  userId: string;
  threadId: string; // Foreign key referencing internal Thread.id (cuid)
  gmailMessageId: string;
  gmailThreadId: string;
  sender: string;
  recipients: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  subject: string | null;
  snippet: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  receivedAt: Date;
}

/**
 * Clean data transfer object matching the existing Prisma `Thread` model columns.
 * `userId` must be supplied by the ingestion caller.
 */
export interface PrismaThreadCreateInput {
  userId: string;
  gmailThreadId: string;
  subject: string | null;
  snippet: string | null;
}
