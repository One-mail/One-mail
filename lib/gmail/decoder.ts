/**
 * Pure utility functions for decoding Base64URL data,
 * RFC 2047 MIME encoded-word headers, and parsing email addresses.
 */

import type { EmailAddress, GmailHeader } from "./types.ts";

/**
 * Decodes a Base64URL encoded string (RFC 4648) into UTF-8 text.
 */
export function decodeBase64Url(data: string | undefined | null): string {
  if (!data || typeof data !== "string") {
    return "";
  }

  const trimmed = data.trim();
  // Base64URL characters must be A-Z, a-z, 0-9, -, _, and optional padding =
  if (!/^[A-Za-z0-9_-]+=*$/.test(trimmed)) {
    return "";
  }

  try {
    return Buffer.from(trimmed, "base64url").toString("utf-8");
  } catch {
    // Fallback: replace URL-safe chars and standard base64 decode
    try {
      let normalized = data.replace(/-/g, "+").replace(/_/g, "/");
      while (normalized.length % 4 !== 0) {
        normalized += "=";
      }
      return Buffer.from(normalized, "base64").toString("utf-8");
    } catch {
      return "";
    }
  }
}

/**
 * Decodes a single RFC 2047 encoded word token.
 * Example: =?UTF-8?B?VGVzdA==?= or =?ISO-8859-1?Q?Hello_World?=
 */
function decodeSingleMimeWord(charset: string, encoding: string, encodedText: string): string {
  const enc = encoding.toUpperCase();
  const cs = charset.toLowerCase();

  try {
    let bytes: Buffer;

    if (enc === "B") {
      // Base64 encoding
      bytes = Buffer.from(encodedText, "base64");
    } else if (enc === "Q") {
      // Quoted-Printable encoding: '_' represents space (0x20)
      const sanitized = encodedText.replace(/_/g, " ");
      const byteList: number[] = [];
      let i = 0;
      while (i < sanitized.length) {
        if (sanitized[i] === "=" && i + 2 < sanitized.length) {
          const hex = sanitized.slice(i + 1, i + 3);
          const parsed = parseInt(hex, 16);
          if (!Number.isNaN(parsed)) {
            byteList.push(parsed);
            i += 3;
            continue;
          }
        }
        byteList.push(sanitized.charCodeAt(i));
        i++;
      }
      bytes = Buffer.from(byteList);
    } else {
      return encodedText;
    }

    if (cs === "iso-8859-1" || cs === "latin1") {
      return bytes.toString("latin1");
    }
    if (cs === "ascii" || cs === "us-ascii") {
      return bytes.toString("ascii");
    }
    return bytes.toString("utf-8");
  } catch {
    return encodedText;
  }
}

/**
 * Decodes RFC 2047 MIME encoded words in email headers.
 * Correctly strips linear whitespace between adjacent encoded words per RFC 2047 Section 6.2.
 */
export function decodeMimeHeader(headerValue: string | null | undefined): string {
  if (!headerValue || typeof headerValue !== "string") {
    return "";
  }

  // Remove linear whitespace between adjacent encoded words
  const adjacentEncodedWordsRegex =
    /(=\?[^?]+\?[bBqQ]\?[^?]+\?=)\s+(?==\?[^?]+\?[bBqQ]\?[^?]+\?=)/g;
  const collapsed = headerValue.replace(adjacentEncodedWordsRegex, "$1");

  // Replace each encoded word with its decoded content
  const mimeWordRegex = /=\?([^?]+)\?([bBqQ])\?([^?]+)\?=/g;
  return collapsed.replace(mimeWordRegex, (_match, charset, encoding, encodedText) => {
    return decodeSingleMimeWord(charset, encoding, encodedText);
  });
}

/**
 * Extracts a header value case-insensitively, decoding any MIME encoded-words.
 */
export function getHeaderValue(
  headers: GmailHeader[] | undefined | null,
  headerName: string
): string | null {
  if (!headers || !Array.isArray(headers)) {
    return null;
  }

  const target = headerName.toLowerCase();
  const found = headers.find((h) => h?.name && h.name.toLowerCase() === target);

  if (!found || typeof found.value !== "string") {
    return null;
  }

  return decodeMimeHeader(found.value.trim());
}

/**
 * Parses an individual raw address entry into { name?, address }.
 * Handles:
 * - "Jane Doe" <jane@example.com>
 * - Jane Doe <jane@example.com>
 * - <jane@example.com>
 * - jane@example.com
 */
export function parseSingleAddress(raw: string): EmailAddress | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  // Check for angle brackets: Name <email@domain.com>
  const angleMatch = trimmed.match(/^(.*?)(?:<([^<>@\s]+@[^<>@\s]+)>)/);
  if (angleMatch) {
    let name = angleMatch[1].trim();
    const address = angleMatch[2].trim().toLowerCase();

    // Strip surrounding quotes around display name if present
    if (
      (name.startsWith('"') && name.endsWith('"')) ||
      (name.startsWith("'") && name.endsWith("'"))
    ) {
      name = name.slice(1, -1).trim();
    }

    // Decode MIME encoded words in name if any remained
    name = decodeMimeHeader(name);

    return name ? { name, address } : { address };
  }

  // Standalone email address without brackets
  const plainEmailMatch = trimmed.match(/^([^\s<>"',]+@[^\s<>"',]+)$/);
  if (plainEmailMatch) {
    return { address: plainEmailMatch[1].toLowerCase() };
  }

  // Fallback: search for any email pattern inside string
  const anyEmailMatch = trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (anyEmailMatch) {
    const address = anyEmailMatch[1].toLowerCase();
    const namePart = trimmed.replace(anyEmailMatch[0], "").replace(/[<>()"']/g, "").trim();
    return namePart ? { name: decodeMimeHeader(namePart), address } : { address };
  }

  return null;
}

/**
 * Parses a comma-separated list of email addresses, properly respecting
 * quoted strings (e.g. "Smith, John" <john@smith.org>).
 */
export function parseEmailAddressList(headerValue: string | null | undefined): EmailAddress[] {
  if (!headerValue || typeof headerValue !== "string") {
    return [];
  }

  const decoded = decodeMimeHeader(headerValue.trim());
  const entries: string[] = [];
  let current = "";
  let inQuotes = false;
  let inAngleBrackets = false;

  for (let i = 0; i < decoded.length; i++) {
    const char = decoded[i];

    if (char === '"' && (i === 0 || decoded[i - 1] !== "\\")) {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === "<" && !inQuotes) {
      inAngleBrackets = true;
      current += char;
    } else if (char === ">" && !inQuotes) {
      inAngleBrackets = false;
      current += char;
    } else if (char === "," && !inQuotes && !inAngleBrackets) {
      if (current.trim()) {
        entries.push(current.trim());
      }
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    entries.push(current.trim());
  }

  const results: EmailAddress[] = [];
  for (const entry of entries) {
    const parsed = parseSingleAddress(entry);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}

/**
 * Formats an EmailAddress into a clean display string.
 * Example: "Jane Doe <jane@example.com>" or "jane@example.com"
 */
export function formatEmailAddress(addr: EmailAddress): string {
  if (addr.name && addr.name.trim()) {
    return `${addr.name.trim()} <${addr.address}>`;
  }
  return addr.address;
}
