import type { DebtSummary } from "@/lib/technicalDebtApi";

export type Granularity = "hour" | "day" | "week";

export interface TimelinePoint {
  /** End of the bucket, in epoch milliseconds. */
  at: number;
  label: string;
  /** Total debt across the repository as it stood at the end of the bucket. */
  minutes: number;
  hours: number;
  /** Reviews that landed inside this bucket, for the tooltip. */
  reviews: number;
}

const HOUR = 60 * 60 * 1000;

export const WINDOWS: Record<Granularity, { size: number; buckets: number; label: string }> = {
  hour: { size: HOUR, buckets: 48, label: "Hourly" },
  day: { size: 24 * HOUR, buckets: 30, label: "Daily" },
  week: { size: 7 * 24 * HOUR, buckets: 12, label: "Weekly" },
};

/* The end of the period `now` falls in, so the last bucket is the current
   hour, day or week rather than a window that stops at an arbitrary minute. */
function endOfCurrentPeriod(now: Date, granularity: Granularity): number {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  if (granularity === "hour") return d.getTime() + HOUR;

  d.setHours(0);
  if (granularity === "day") return d.getTime() + 24 * HOUR;

  // Weeks run Monday to Sunday; getDay() calls Sunday 0.
  const daysToMonday = (8 - d.getDay()) % 7 || 7;
  return d.getTime() + daysToMonday * 24 * HOUR;
}

function labelOf(start: number, granularity: Granularity): string {
  const d = new Date(start);
  if (granularity === "hour") {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  const date = d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return granularity === "week" ? `w/c ${date}` : date;
}

/**
 * Total technical debt over time.
 *
 * The repository total is the sum of the latest review of each pull request,
 * so the running total walks the reviews oldest to newest and keeps one
 * figure per pull request, replacing it when that pull request is reviewed
 * again. Summing every review instead would count a re-analysed pull request
 * twice and the line would climb on work that never happened.
 *
 * Every bucket is sampled, not just the ones containing a review: debt that
 * nobody paid down is still owed, so a quiet week is a flat line rather than
 * a gap. The final point is the current total, which is the same number the
 * headline card shows.
 */
export function buildDebtTimeline(
  trend: DebtSummary["trend"],
  granularity: Granularity,
  now: Date = new Date(),
): TimelinePoint[] {
  const { size, buckets } = WINDOWS[granularity];
  const anchor = endOfCurrentPeriod(now, granularity);

  const reviews = [...trend]
    .map((point) => ({
      at: new Date(point.created_at).getTime(),
      pullRequest: point.pull_request_number,
      minutes: point.total_debt_minutes,
    }))
    .filter((r) => Number.isFinite(r.at))
    .sort((a, b) => a.at - b.at);

  const latestPerPullRequest = new Map<number, number>();
  let cursor = 0;
  const points: TimelinePoint[] = [];

  for (let i = 0; i < buckets; i += 1) {
    const end = anchor - (buckets - 1 - i) * size;
    let landed = 0;

    while (cursor < reviews.length && reviews[cursor].at < end) {
      latestPerPullRequest.set(reviews[cursor].pullRequest, reviews[cursor].minutes);
      cursor += 1;
      landed += 1;
    }

    const minutes = [...latestPerPullRequest.values()].reduce((sum, m) => sum + m, 0);

    points.push({
      at: end,
      label: labelOf(end - size, granularity),
      minutes,
      hours: Math.round((minutes / 60) * 100) / 100,
      reviews: landed,
    });
  }

  return points;
}

/**
 * The widest granularity whose window still covers the history, so the chart
 * opens on a line that has something in it rather than on 48 flat hours.
 */
export function defaultGranularity(
  trend: DebtSummary["trend"],
  now: Date = new Date(),
): Granularity {
  if (trend.length === 0) return "day";

  const oldest = Math.min(...trend.map((p) => new Date(p.created_at).getTime()));
  const span = now.getTime() - oldest;

  if (span <= WINDOWS.hour.size * WINDOWS.hour.buckets) return "hour";
  if (span <= WINDOWS.day.size * WINDOWS.day.buckets) return "day";
  return "week";
}
