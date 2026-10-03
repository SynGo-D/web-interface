"use client";

import { Fragment, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  getPullRequestDebt,
  type DebtIssue,
  type DebtReview,
} from "@/lib/technicalDebtApi";
import DebtIssueList from "./DebtIssueList";
import {
  HEALTH_STYLES,
  formatCost,
  formatDate,
  formatMinutes,
} from "./debtFormat";

type PullRequestDebtTableProps = {
  repository: string;
  pullRequests: DebtReview[];
  calculating: boolean;
  /** False for a manager, who reads the assessment but does not rerun it. */
  mayRecalculate: boolean;
  onRecalculate: (pullRequestNumber: number) => void;
};

type IssuesState = DebtIssue[] | "loading" | "error";

export default function PullRequestDebtTable({
  repository,
  pullRequests,
  calculating,
  mayRecalculate,
  onRecalculate,
}: PullRequestDebtTableProps) {

  const [openReview, setOpenReview] = useState<string | null>(null);

  // Issues are fetched when a row is first expanded, keyed by review id.
  const [issues, setIssues] = useState<Record<string, IssuesState>>({});

  const toggle = async (review: DebtReview) => {
    if (openReview === review.id) {
      setOpenReview(null);
      return;
    }

    setOpenReview(review.id);

    if (Array.isArray(issues[review.id])) return;

    setIssues((prev) => ({ ...prev, [review.id]: "loading" }));

    try {
      const full = await getPullRequestDebt(repository, review.pull_request_number);
      setIssues((prev) => ({ ...prev, [review.id]: full.issues ?? [] }));
    } catch {
      setIssues((prev) => ({ ...prev, [review.id]: "error" }));
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-lg font-bold text-gray-800">
          Pull Requests
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Latest debt review of each Pull Request. Select a row to see its issues.
        </p>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full min-w-[760px] text-left text-sm">

          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
              <th className="py-3 pr-4 font-medium">Pull Request</th>
              <th className="py-3 pr-4 font-medium">Health</th>
              <th className="py-3 pr-4 font-medium">Debt</th>
              <th className="py-3 pr-4 font-medium">Cost</th>
              <th className="py-3 pr-4 font-medium">Debt Ratio</th>
              <th className="py-3 pr-4 font-medium">Issues</th>
              <th className="py-3 pr-4 font-medium">Calculated</th>
              <th className="py-3 font-medium" />
            </tr>
          </thead>

          <tbody>
            {pullRequests.map((review) => {
              const isOpen = openReview === review.id;
              const health = HEALTH_STYLES[review.health_status] ?? HEALTH_STYLES.GOOD;
              const reviewIssues = issues[review.id];

              return (
                <Fragment key={review.id}>

                  <tr
                    onClick={() => toggle(review)}
                    className="cursor-pointer border-b border-gray-100 transition hover:bg-gray-50"
                  >

                    <td className="py-4 pr-4">
                      <span className="rounded-md bg-[#4338CA]/10 px-2 py-1 text-xs font-bold text-[#4338CA]">
                        #{review.pull_request_number}
                      </span>
                      <span className="ml-2 font-mono text-xs text-gray-400">
                        {review.commit_sha.slice(0, 7)}
                      </span>
                    </td>

                    <td className="py-4 pr-4">
                      <span className="font-semibold text-gray-800">
                        {review.health_score}
                      </span>
                      <span className={`ml-2 rounded-full px-2.5 py-1 text-xs font-semibold ${health.badge}`}>
                        {health.label}
                      </span>
                    </td>

                    <td className="py-4 pr-4 font-medium text-gray-700">
                      {formatMinutes(review.total_debt_minutes)}
                    </td>

                    <td className="py-4 pr-4 text-gray-700">
                      {formatCost(review.estimated_cost)}
                    </td>

                    <td
                      className="py-4 pr-4 text-gray-700"
                      title="Debt minutes per changed line"
                    >
                      {review.debt_ratio == null ? "—" : review.debt_ratio.toFixed(2)}
                    </td>

                    <td className="py-4 pr-4 text-gray-700">
                      {review.total_findings}
                      {review.critical_issues > 0 && (
                        <span className="ml-2 text-xs font-semibold text-red-600">
                          {review.critical_issues} critical
                        </span>
                      )}
                    </td>

                    <td className="py-4 pr-4 text-gray-500">
                      {formatDate(review.created_at)}
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">

                        {mayRecalculate && (
                          <button
                            type="button"
                            title="Recalculate this Pull Request"
                            disabled={calculating}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRecalculate(review.pull_request_number);
                            }}
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-white hover:text-[#4338CA] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RefreshCw size={15} />
                          </button>
                        )}

                        {isOpen ? (
                          <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400" />
                        )}

                      </div>
                    </td>

                  </tr>

                  {isOpen && (
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td
                        colSpan={8}
                        className="p-5"
                      >
                        {reviewIssues === "loading" || reviewIssues === undefined ? (
                          <p className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                            <Loader2 size={16} className="animate-spin" />
                            Loading issues…
                          </p>
                        ) : reviewIssues === "error" ? (
                          <p className="py-4 text-center text-sm text-red-600">
                            Could not load this Pull Request&apos;s issues.
                          </p>
                        ) : (
                          <DebtIssueList issues={reviewIssues} />
                        )}
                      </td>
                    </tr>
                  )}

                </Fragment>
              );
            })}
          </tbody>

        </table>

      </div>

    </div>
  );
}
