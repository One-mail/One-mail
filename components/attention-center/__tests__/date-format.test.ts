/**
 * Comprehensive Automated Tests for Attention Center Date Formatting.
 *
 * Verifies:
 * 1. Deterministic date/time formatting between SSR and browser hydration
 * 2. formatEventSchedule produces consistent "Thu, Oct 22 • 10:00 AM – 11:00 AM" formatting
 * 3. formatFullDateTime produces consistent "Thu, Oct 22, 10:00 AM" formatting
 * 4. formatCountdown produces stable countdowns and "Tomorrow at 10:00 AM" labels
 * 5. Stability across differing time zones when explicitly specified
 * 6. Edge cases: missing dates, invalid dates, single start times
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_LOCALE,
  formatCountdown,
  formatEventSchedule,
  formatFullDateTime,
} from "../utils.ts";

describe("Attention Center — formatEventSchedule Hydration Stability", () => {
  const startIso = "2026-10-22T10:00:00.000Z";
  const endIso = "2026-10-22T11:00:00.000Z";

  it("1. formats event schedule with explicit UTC timezone deterministically", () => {
    const formatted = formatEventSchedule(startIso, endIso, { timeZone: "UTC" });
    assert.equal(formatted, "Thu, Oct 22 • 10:00 AM – 11:00 AM");
  });

  it("2. produces stable output across different locales when DEFAULT_LOCALE is en-US", () => {
    // Explicit en-US
    const usResult = formatEventSchedule(startIso, endIso, { locale: "en-US", timeZone: "UTC" });
    assert.equal(usResult, "Thu, Oct 22 • 10:00 AM – 11:00 AM");

    // Default locale (should match en-US)
    const defaultResult = formatEventSchedule(startIso, endIso, { timeZone: "UTC" });
    assert.equal(defaultResult, usResult);
    assert.equal(DEFAULT_LOCALE, "en-US");
  });

  it("3. handles start-only events without end time", () => {
    const formatted = formatEventSchedule(startIso, null, { timeZone: "UTC" });
    assert.equal(formatted, "Thu, Oct 22 at 10:00 AM");
  });

  it("4. handles undefined or empty dates gracefully", () => {
    assert.equal(formatEventSchedule(undefined, undefined), "Schedule pending");
    assert.equal(formatEventSchedule(null, null), "Schedule pending");
    assert.equal(formatEventSchedule(""), "Schedule pending");
  });

  it("5. handles invalid date strings gracefully", () => {
    assert.equal(formatEventSchedule("not-a-date", "also-not-a-date"), "Invalid date");
    assert.equal(
      formatEventSchedule(startIso, "invalid-end", { timeZone: "UTC" }),
      "Thu, Oct 22 at 10:00 AM"
    );
  });

  it("6. formats correctly for different explicit timezones without crashing", () => {
    // In Asia/Kolkata (UTC+5:30)
    const kolkata = formatEventSchedule(startIso, endIso, { timeZone: "Asia/Kolkata" });
    assert.equal(kolkata, "Thu, Oct 22 • 3:30 PM – 4:30 PM");

    // In America/New_York (EDT UTC-4)
    const newYork = formatEventSchedule(startIso, endIso, { timeZone: "America/New_York" });
    assert.equal(newYork, "Thu, Oct 22 • 6:00 AM – 7:00 AM");
  });
});

describe("Attention Center — formatFullDateTime Hydration Stability", () => {
  const dateIso = "2026-10-22T10:00:00.000Z";

  it("7. formats full date and time deterministically in en-US", () => {
    const formatted = formatFullDateTime(dateIso, { timeZone: "UTC" });
    assert.equal(formatted, "Thu, Oct 22, 10:00 AM");
  });

  it("8. handles missing or invalid date strings", () => {
    assert.equal(formatFullDateTime(null), "Not specified");
    assert.equal(formatFullDateTime(undefined), "Not specified");
    assert.equal(formatFullDateTime(""), "Not specified");
    assert.equal(formatFullDateTime("invalid-date-xyz"), "Invalid date");
  });
});

describe("Attention Center — formatCountdown Hydration Stability", () => {
  const baseTime = new Date("2026-10-21T10:00:00.000Z");

  it("9. formats 'Tomorrow at X' with uppercase AM/PM and en-US locale", () => {
    // Target is exactly tomorrow at 10:00 AM UTC
    const targetTomorrow = "2026-10-22T10:00:00.000Z";
    const result = formatCountdown(targetTomorrow, {
      baseDate: baseTime,
      timeZone: "UTC",
    });

    assert.equal(result.isOverdue, false);
    assert.equal(result.hasDate, true);
    assert.equal(result.label, "Tomorrow at 10:00 AM");
  });

  it("10. calculates future relative countdowns correctly", () => {
    // Due in 30 minutes
    const dueIn30m = new Date(baseTime.getTime() + 30 * 60 * 1000).toISOString();
    const res30m = formatCountdown(dueIn30m, { baseDate: baseTime });
    assert.equal(res30m.label, "Due in 30m");
    assert.equal(res30m.isUrgent, true);

    // Due in 3 hours
    const dueIn3h = new Date(baseTime.getTime() + 3 * 3600 * 1000).toISOString();
    const res3h = formatCountdown(dueIn3h, { baseDate: baseTime });
    assert.equal(res3h.label, "Due in 3h");

    // Due in 4 days
    const dueIn4d = new Date(baseTime.getTime() + 4 * 86400 * 1000).toISOString();
    const res4d = formatCountdown(dueIn4d, { baseDate: baseTime });
    assert.equal(res4d.label, "Due in 4 days");
  });

  it("11. calculates overdue relative countdowns correctly", () => {
    // Overdue by 15 minutes
    const overdue15m = new Date(baseTime.getTime() - 15 * 60 * 1000).toISOString();
    const res15m = formatCountdown(overdue15m, { baseDate: baseTime });
    assert.equal(res15m.label, "Overdue by 15m");
    assert.equal(res15m.isOverdue, true);

    // Overdue by 2 hours
    const overdue2h = new Date(baseTime.getTime() - 2 * 3600 * 1000).toISOString();
    const res2h = formatCountdown(overdue2h, { baseDate: baseTime });
    assert.equal(res2h.label, "Overdue by 2h");
    assert.equal(res2h.isOverdue, true);
  });

  it("12. handles missing or invalid target dates", () => {
    const noDate = formatCountdown(null);
    assert.equal(noDate.label, "No date set");
    assert.equal(noDate.hasDate, false);

    const invalidDate = formatCountdown("invalid");
    assert.equal(invalidDate.label, "Invalid date");
    assert.equal(invalidDate.hasDate, false);
  });

  it("13. formatEventSchedule produces identical deterministic output without options", () => {
    const testStart = "2026-10-22T10:00:00.000Z";
    const testEnd = "2026-10-22T11:00:00.000Z";
    const withoutOptions = formatEventSchedule(testStart, testEnd);
    const withExplicitUtc = formatEventSchedule(testStart, testEnd, { timeZone: "UTC", locale: "en-US" });
    assert.equal(withoutOptions, "Thu, Oct 22 • 10:00 AM – 11:00 AM");
    assert.equal(withoutOptions, withExplicitUtc);
  });

  it("14. formatFullDateTime produces identical deterministic output without options", () => {
    const dateIso = "2026-10-22T10:00:00.000Z";
    const withoutOptions = formatFullDateTime(dateIso);
    const withExplicitUtc = formatFullDateTime(dateIso, { timeZone: "UTC", locale: "en-US" });
    assert.equal(withoutOptions, "Thu, Oct 22, 10:00 AM");
    assert.equal(withoutOptions, withExplicitUtc);
  });

  it("15. guarantees identical initial countdown output between server and client hydration when baseDate is anchored", () => {
    const deadline = "2026-10-22T13:30:00.000Z";
    const serverTimestamp = new Date("2026-10-22T10:00:00.000Z").getTime();

    // Server SSR pass
    const serverRendered = formatCountdown(deadline, { baseDate: serverTimestamp });

    // Client initial hydration pass (anchored to baseDate/INITIAL_BASE_TIME)
    const clientFirstRender = formatCountdown(deadline, { baseDate: serverTimestamp });

    assert.equal(serverRendered.label, "Due in 3h 30m");
    assert.equal(clientFirstRender.label, "Due in 3h 30m");
    assert.equal(serverRendered.label, clientFirstRender.label);
    assert.equal(serverRendered.isUrgent, clientFirstRender.isUrgent);
    assert.equal(serverRendered.isOverdue, clientFirstRender.isOverdue);
  });
});

