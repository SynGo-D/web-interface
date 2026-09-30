"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronUp,
  Clock,
  FileCode2,
  ShieldAlert,
} from "lucide-react";

import type { DebtIssue } from "@/lib/technicalDebtApi";
import { RISK_STYLES, formatMinutes, titleCase } from "./debtFormat";

type Issue = DebtIssue & { pull_request_number?: number };

export default function DebtIssueList({ issues }: { issues: Issue[] }) {

  const [openIssue, setOpenIssue] = useState<string | null>(null);

  if (issues.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No debt issues.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => {
        const styles = RISK_STYLES[issue.risk];
        const isOpen = openIssue === issue.id;
        const Icon =
          issue.debt_type === "SECURITY"
            ? ShieldAlert
            : issue.debt_type === "BUG" || issue.debt_type === "RELIABILITY"
              ? Bug
              : AlertTriangle;

        return (
          <div
            key={issue.id}
            className="overflow-hidden rounded-xl border border-gray-200"
          >

            <button
              type="button"
              onClick={() => setOpenIssue(isOpen ? null : issue.id)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-gray-50"
            >

              <div className="flex min-w-0 items-center gap-3">

                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.background}`}>
                  <Icon
                    size={20}
                    className={styles.icon}
                  />
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles.badge}`}>
                      {titleCase(issue.risk)}
                    </span>

                    <span className="text-xs text-gray-400">
                      {titleCase(issue.debt_type)}
                    </span>

                    {issue.pull_request_number != null && (
                      <span className="rounded-md bg-[#4338CA]/10 px-2 py-0.5 text-xs font-bold text-[#4338CA]">
                        #{issue.pull_request_number}
                      </span>
                    )}

                  </div>

                  <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                    {issue.rule_id ?? issue.tool} — {issue.file_path}
                    {issue.line != null && `:${issue.line}`}
                  </p>

                </div>

              </div>

              <div className="flex shrink-0 items-center gap-3">

                <span className="flex items-center gap-1 text-sm font-medium text-gray-600">
                  <Clock size={15} />
                  {formatMinutes(issue.estimated_minutes)}
                </span>

                {isOpen ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}

              </div>

            </button>

            {isOpen && (
              <div className="border-t border-gray-100 bg-gray-50 p-5">

                <div className="flex flex-wrap items-center gap-2">

                  <FileCode2
                    size={17}
                    className="text-[#4338CA]"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    {issue.file_path}
                  </span>

                  {issue.line != null && (
                    <span className="text-xs text-gray-400">
                      Line {issue.line}
                    </span>
                  )}

                  <span className="text-xs text-gray-400">
                    · {issue.tool}
                  </span>

                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">

                  <div>
                    <p className="text-gray-400">Impact</p>
                    <p className="font-semibold text-gray-700">{titleCase(issue.impact)}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Estimated effort</p>
                    <p className="font-semibold text-gray-700">{formatMinutes(issue.estimated_minutes)}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Confidence</p>
                    <p className="font-semibold text-gray-700">
                      {issue.confidence == null ? "—" : `${Math.round(issue.confidence * 100)}%`}
                    </p>
                  </div>

                </div>

                {issue.recommendation && (
                  <div className="mt-4 rounded-lg border border-[#4338CA]/10 bg-white p-4">

                    <h4 className="text-sm font-semibold text-[#4338CA]">
                      Recommendation
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {issue.recommendation}
                    </p>

                  </div>
                )}

              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
