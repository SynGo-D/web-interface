import { describe, expect, it } from "vitest";
import { WINDOWS, buildDebtTimeline, defaultGranularity } from "@/lib/debtTimeline";
import type { DebtSummary } from "@/lib/technicalDebtApi";

type Point = DebtSummary["trend"][number];

const NOW = new Date("2026-03-10T14:30:00Z");

function review(at: string, pullRequest: number, minutes: number): Point {
  return {
    created_at: at,
    pull_request_number: pullRequest,
    commit_sha: "c".repeat(40),
    health_score: 70,
    total_debt_minutes: minutes,
  };
}

describe("debt timeline", () => {
  it("accumulates one figure per pull request, not one per review", () => {
    const points = buildDebtTimeline(
      [
        review("2026-03-10T09:00:00Z", 1, 100),
        review("2026-03-10T10:00:00Z", 2, 50),
        // PR 1 re-analysed: replaces its 100, it does not add to it.
        review("2026-03-10T11:00:00Z", 1, 120),
      ],
      "hour",
      NOW,
    );

    expect(points.at(-1)!.minutes).toBe(170);
  });

  it("holds the total flat through buckets with no review", () => {
    const points = buildDebtTimeline([review("2026-03-10T09:00:00Z", 1, 90)], "hour", NOW);
    const after = points.filter((p) => p.at > new Date("2026-03-10T10:00:00Z").getTime());

    expect(after.every((p) => p.minutes === 90)).toBe(true);
    expect(after.every((p) => p.reviews === 0)).toBe(true);
  });

  it("reads zero before the first review rather than back-filling it", () => {
    const points = buildDebtTimeline([review("2026-03-10T09:00:00Z", 1, 90)], "hour", NOW);

    expect(points[0].minutes).toBe(0);
    expect(points.some((p) => p.minutes === 90)).toBe(true);
  });

  it("ends on the current total, the figure the headline card shows", () => {
    const points = buildDebtTimeline(
      [review("2026-02-01T09:00:00Z", 1, 600), review("2026-03-09T09:00:00Z", 2, 334)],
      "week",
      NOW,
    );

    expect(points.at(-1)!.minutes).toBe(934);
    expect(points.at(-1)!.hours).toBe(15.57);
  });

  it("counts the reviews that landed in each bucket", () => {
    // Within the same minute, so the pair cannot straddle an hour boundary
    // in a timezone offset by :30 or :45.
    const points = buildDebtTimeline(
      [review("2026-03-10T09:01:00Z", 1, 10), review("2026-03-10T09:01:30Z", 2, 10)],
      "hour",
      NOW,
    );

    expect(points.filter((p) => p.reviews > 0)).toHaveLength(1);
    expect(points.find((p) => p.reviews > 0)!.reviews).toBe(2);
  });

  it("returns a full window at every granularity, even with no data", () => {
    for (const g of ["hour", "day", "week"] as const) {
      const points = buildDebtTimeline([], g, NOW);
      expect(points).toHaveLength(WINDOWS[g].buckets);
      expect(points.every((p) => p.minutes === 0)).toBe(true);
    }
  });

  it("sorts reviews that arrive out of order", () => {
    const ordered = buildDebtTimeline(
      [review("2026-03-10T09:00:00Z", 1, 100), review("2026-03-10T11:00:00Z", 1, 120)],
      "hour",
      NOW,
    );
    const reversed = buildDebtTimeline(
      [review("2026-03-10T11:00:00Z", 1, 120), review("2026-03-10T09:00:00Z", 1, 100)],
      "hour",
      NOW,
    );

    expect(reversed.map((p) => p.minutes)).toEqual(ordered.map((p) => p.minutes));
  });

  it("opens on the granularity whose window covers the history", () => {
    expect(defaultGranularity([review("2026-03-10T09:00:00Z", 1, 10)], NOW)).toBe("hour");
    expect(defaultGranularity([review("2026-03-01T09:00:00Z", 1, 10)], NOW)).toBe("day");
    expect(defaultGranularity([review("2025-09-01T09:00:00Z", 1, 10)], NOW)).toBe("week");
    expect(defaultGranularity([], NOW)).toBe("day");
  });
});
