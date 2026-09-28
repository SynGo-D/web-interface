"use client";

import { useEffect, useState } from "react";
import { ApiError, getReviewUsage, type ReviewUsage } from "@/lib/api";
import MetricCard from "@/components/analysis/MetricCard";

function percent(rate: number | null): string {
  return rate === null ? "—" : `${Math.round(rate * 100)}%`;
}

/**
 * How the AI review is doing for one repository: what it cost, and what
 * developers thought of the issues it raised. The share marked "wrong" is
 * the real false-alarm rate, the number that decides whether developers
 * keep trusting the review.
 */
export default function ReviewUsagePanel({ owner, repo, days = 30 }: { owner: string; repo: string; days?: number }) {
  const [usage, setUsage] = useState<ReviewUsage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    getReviewUsage(owner, repo, days)
      .then((body) => current && setUsage(body))
      .catch((err) => current && setError(err instanceof ApiError ? err.message : "Couldn't load AI review usage."));
    return () => {
      current = false;
    };
  }, [owner, repo, days]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">AI review · last {days} days</h2>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {!usage && !error && <p className="mt-3 text-gray-500">Loading…</p>}
      {usage && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard label="Reviews" value={usage.reviews} />
            <MetricCard label="Total Cost" value={`$${usage.cost_usd.toFixed(4)}`} />
            <MetricCard label="Issues Reported" value={usage.issues_reported} />
            <MetricCard label="Marked Wrong" value={percent(usage.wrong_rate)} />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            {usage.completed} completed, {usage.failed} failed, {usage.skipped} skipped
            {usage.cost_per_review_usd !== null && ` · $${usage.cost_per_review_usd.toFixed(4)} per review`} ·
            ratings: {usage.feedback.useful} useful, {usage.feedback.not_useful} not useful, {usage.feedback.wrong} wrong
          </p>
        </>
      )}
    </div>
  );
}
