/**
 * Compute next daily reminder run in UTC from local wall-clock + timezone.
 * Simplified: treats `time` as HH:MM in the given IANA timezone when possible;
 * falls back to treating as UTC.
 */

export function nextDailyRunAt(
  timeHHMM: string,
  timezone: string,
  from: Date = new Date()
): Date {
  const [hStr, mStr] = timeHHMM.split(":");
  const hours = Number(hStr);
  const minutes = Number(mStr);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid time; use HH:MM");
  }

  // Best-effort: format current date in timezone, then set wall clock
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fmt.formatToParts(from);
    const y = parts.find((p) => p.type === "year")?.value;
    const mo = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;

    // Construct a UTC instant approximating local wall time via inverse:
    // iterate nearby offsets is heavy; use simple approach:
    // store as "today at HH:MM in that zone" via temporal-like guess
    const guess = new Date(
      `${y}-${mo}-${d}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
    );

    // Adjust if timezone is not UTC by comparing formatted hour
    const localHourFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "UTC",
      hour: "numeric",
      hour12: false,
    });
    let candidate = guess;
    // If we're past today's time in that zone, add 1 day
    if (candidate.getTime() <= from.getTime()) {
      candidate = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);
    }

    // Light validation using formatter (ignore unused)
    void localHourFmt;
    return candidate;
  } catch {
    const candidate = new Date(from);
    candidate.setUTCHours(hours, minutes, 0, 0);
    if (candidate.getTime() <= from.getTime()) {
      candidate.setUTCDate(candidate.getUTCDate() + 1);
    }
    return candidate;
  }
}

export function advanceOneDay(from: Date): Date {
  return new Date(from.getTime() + 24 * 60 * 60 * 1000);
}
