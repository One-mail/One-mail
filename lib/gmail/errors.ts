/**
 * Error classes for Gmail API response normalization.
 */

export class GmailAdapterError extends Error {
  public readonly code: string;

  constructor(message: string, code = "GMAIL_ADAPTER_ERROR") {
    super(message);
    this.name = "GmailAdapterError";
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MalformedPayloadError extends GmailAdapterError {
  public readonly payload: unknown;

  constructor(message: string, payload?: unknown) {
    super(message, "MALFORMED_GMAIL_PAYLOAD");
    this.name = "MalformedPayloadError";
    this.payload = payload;
  }
}

export class DecodeError extends GmailAdapterError {
  constructor(message: string) {
    super(message, "DECODE_ERROR");
    this.name = "DecodeError";
  }
}

export class GmailAuthError extends GmailAdapterError {
  constructor(message: string, code = "GMAIL_AUTH_ERROR") {
    super(message, code);
    this.name = "GmailAuthError";
  }
}

export class GmailApiError extends GmailAdapterError {
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message, "GMAIL_API_ERROR");
    this.name = "GmailApiError";
    this.status = status;
    this.details = details;
  }
}
