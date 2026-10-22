/**
 * OneMail Gmail Ingestion Data Adapter
 *
 * Provides pure, typed normalization of Gmail API v1 response payloads
 * into internal representations and Prisma model compatibility inputs.
 */

export type * from "./types.ts";
export * from "./errors.ts";
export * from "./decoder.ts";
export * from "./adapter.ts";
export * from "./token.ts";
export * from "./client.ts";
export * from "./ingest.ts";
