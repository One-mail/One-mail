import type { AttentionCategory, UrgencyLevel } from "./types.ts";

/**
 * Standard locale used for deterministic date/time formatting across server (SSR) and client (hydration).
 */
export const DEFAULT_LOCALE = "en-US";

/**
 * Standard timezone used for deterministic date/time formatting across server (SSR) and client (hydration).
 */
export const DEFAULT_TIMEZONE = "UTC";

/**
 * Stable base anchor evaluated at module load time for deterministic initial countdown renders.
 */
export const INITIAL_BASE_TIME = new Date().getTime();

export interface DateFormatOptions {
  /**
   * BCP 47 language tag (e.g., 'en-US'). Defaults to 'en-US' for deterministic SSR hydration.
   */
  locale?: string;
  /**
   * IANA time zone identifier (e.g., 'UTC', 'America/New_York'). Defaults to 'UTC'.
   */
  timeZone?: string;
}

export interface CountdownOptions extends DateFormatOptions {
  /**
   * Base date to calculate difference from. Defaults to `new Date()`.
   * Useful for deterministic testing or stable SSR anchoring.
   */
  baseDate?: Date | string | number;
}

/**
 * Calculates a human-readable countdown or overdue status for a given target date.
 */
export function formatCountdown(
  targetIsoDate: string | null | undefined,
  options?: CountdownOptions
): {
  label: string;
  isOverdue: boolean;
  isUrgent: boolean;
  hasDate: boolean;
} {
  if (!targetIsoDate) {
    return {
      label: "No date set",
      isOverdue: false,
      isUrgent: false,
      hasDate: false,
    };
  }

  const target = new Date(targetIsoDate);
  if (isNaN(target.getTime())) {
    return {
      label: "Invalid date",
      isOverdue: false,
      isUrgent: false,
      hasDate: false,
    };
  }

  const now = options?.baseDate ? new Date(options.baseDate) : new Date();
  const diffMs = target.getTime() - now.getTime();
  const isOverdue = diffMs < 0;
  const absDiffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
  const absDiffHours = Math.floor(absDiffMinutes / 60);
  const absDiffDays = Math.floor(absDiffHours / 24);

  if (isOverdue) {
    if (absDiffMinutes < 60) {
      return {
        label: `Overdue by ${absDiffMinutes}m`,
        isOverdue: true,
        isUrgent: true,
        hasDate: true,
      };
    }
    if (absDiffHours < 24) {
      return {
        label: `Overdue by ${absDiffHours}h`,
        isOverdue: true,
        isUrgent: true,
        hasDate: true,
      };
    }
    return {
      label: `Overdue by ${absDiffDays}d`,
      isOverdue: true,
      isUrgent: true,
      hasDate: true,
    };
  }

  // Future deadline
  const isUrgent = absDiffHours <= 6; // Less than 6 hours is urgent

  if (absDiffMinutes < 60) {
    return {
      label: `Due in ${absDiffMinutes}m`,
      isOverdue: false,
      isUrgent: true,
      hasDate: true,
    };
  }
  if (absDiffHours < 24) {
    const remainingMins = absDiffMinutes % 60;
    return {
      label: remainingMins > 0 ? `Due in ${absDiffHours}h ${remainingMins}m` : `Due in ${absDiffHours}h`,
      isOverdue: false,
      isUrgent,
      hasDate: true,
    };
  }
  if (absDiffDays === 1) {
    const locale = options?.locale ?? DEFAULT_LOCALE;
    const timeZone = options?.timeZone ?? DEFAULT_TIMEZONE;
    const timeStr = target.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    });
    return {
      label: `Tomorrow at ${timeStr}`,
      isOverdue: false,
      isUrgent: false,
      hasDate: true,
    };
  }

  return {
    label: `Due in ${absDiffDays} days`,
    isOverdue: false,
    isUrgent: false,
    hasDate: true,
  };
}

/**
 * Formats full date and time for detail views.
 */
export function formatFullDateTime(
  isoDate: string | null | undefined,
  options?: DateFormatOptions
): string {
  if (!isoDate) return "Not specified";
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return "Invalid date";

  const locale = options?.locale ?? DEFAULT_LOCALE;
  const timeZone = options?.timeZone ?? DEFAULT_TIMEZONE;

  return d.toLocaleString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
}

/**
 * Formats calendar event range.
 */
export function formatEventSchedule(
  startIso?: string | null,
  endIso?: string | null,
  options?: DateFormatOptions
): string {
  if (!startIso) return "Schedule pending";
  const start = new Date(startIso);
  if (isNaN(start.getTime())) return "Invalid date";

  const locale = options?.locale ?? DEFAULT_LOCALE;
  const timeZone = options?.timeZone ?? DEFAULT_TIMEZONE;

  const startDateStr = start.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone,
  });
  const startTimeStr = start.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });

  if (!endIso) {
    return `${startDateStr} at ${startTimeStr}`;
  }

  const end = new Date(endIso);
  if (isNaN(end.getTime())) {
    return `${startDateStr} at ${startTimeStr}`;
  }

  const endTimeStr = end.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  });
  return `${startDateStr} • ${startTimeStr} – ${endTimeStr}`;
}

export function getUrgencyBadgeStyle(urgency: UrgencyLevel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (urgency) {
    case "CRITICAL":
      return {
        bg: "bg-red-500/10 dark:bg-red-500/20",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-500/30",
      };
    case "HIGH":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-500/30",
      };
    case "NORMAL":
      return {
        bg: "bg-blue-500/10 dark:bg-blue-500/20",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-500/30",
      };
    case "LOW":
    default:
      return {
        bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
        text: "text-zinc-600 dark:text-zinc-400",
        border: "border-zinc-500/30",
      };
  }
}

export function getCategoryBadgeStyle(category: AttentionCategory): {
  bg: string;
  text: string;
} {
  switch (category) {
    case "Client":
      return { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-300" };
    case "Finance":
      return { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300" };
    case "Hiring":
      return { bg: "bg-cyan-500/10 dark:bg-cyan-500/20", text: "text-cyan-700 dark:text-cyan-300" };
    case "Engineering":
      return { bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-700 dark:text-indigo-300" };
    case "Legal":
      return { bg: "bg-rose-500/10 dark:bg-rose-500/20", text: "text-rose-700 dark:text-rose-300" };
    case "Operations":
    case "General":
    default:
      return { bg: "bg-zinc-500/10 dark:bg-zinc-500/20", text: "text-zinc-700 dark:text-zinc-300" };
  }
}

export { useLiveCountdown } from "./useLiveCountdown.ts";
