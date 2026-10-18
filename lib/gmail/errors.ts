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
