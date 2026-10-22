import { useEffect, useState } from "react";
import type { CountdownOptions } from "./utils.ts";
import {
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  INITIAL_BASE_TIME,
  formatCountdown,
} from "./utils.ts";

/**
 * Custom React hook for live countdown updates that eliminates hydration mismatches.
 *
 * During SSR and initial client hydration pass:
 * - Uses a deterministic initialBaseDate (options.baseDate or INITIAL_BASE_TIME) to calculate
 *   a countdown identical to the server-rendered HTML.
 *
 * After hydration:
 * - Updates asynchronously to live client time (`new Date()`).
 * - Ticks periodically every 30 seconds for real-time countdown updates.
 */
export function useLiveCountdown(
  targetIsoDate: string | null | undefined,
  options?: CountdownOptions
): {
  label: string;
  isOverdue: boolean;
  isUrgent: boolean;
  hasDate: boolean;
} {
  const initialBaseDate = options?.baseDate ?? INITIAL_BASE_TIME;
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const timeZone = options?.timeZone ?? DEFAULT_TIMEZONE;

  // Initial render: deterministic, matches server-rendered HTML
  const [countdown, setCountdown] = useState(() =>
    formatCountdown(targetIsoDate, {
      locale,
      timeZone,
      baseDate: initialBaseDate,
    })
  );

  useEffect(() => {
    let isCancelled = false;

    const updateCountdown = () => {
      if (!isCancelled) {
        setCountdown(
          formatCountdown(targetIsoDate, {
            locale,
            timeZone,
            baseDate: undefined,
          })
        );
      }
    };

    // Post-hydration: update asynchronously to live client time
    const initialTimeout = setTimeout(updateCountdown, 0);

    if (!targetIsoDate) {
      return () => {
        isCancelled = true;
        clearTimeout(initialTimeout);
      };
    }

    const timer = setInterval(updateCountdown, 30000);

    return () => {
      isCancelled = true;
      clearTimeout(initialTimeout);
      clearInterval(timer);
    };
  }, [targetIsoDate, locale, timeZone]);

  return countdown;
}
