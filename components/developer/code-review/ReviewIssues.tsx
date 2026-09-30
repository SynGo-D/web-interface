"use client";

import { useState } from "react";

import {
  AlertTriangle,
  Bug,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileCode2,
} from "lucide-react";

const issues = [
  {
    id: 1,
    severity: "Critical",
    title: "SQL query contains potential injection vulnerability",
    file: "src/api/users.ts",
    line: 48,
    category: "Security",
    description:
      "User input is directly included in the SQL query without parameterization. This may allow malicious SQL injection attacks.",
    suggestion:
      "Use parameterized queries or a prepared statement instead of directly concatenating user input.",
  },
  {
    id: 2,
    severity: "Critical",
    title: "Sensitive information exposed in error response",
    file: "src/api/auth.ts",
    line: 72,
    category: "Security",
    description:
      "The API response exposes internal error information that could help an attacker understand the system.",
    suggestion:
      "Return a generic error message to the client and log the detailed error on the server.",
  },
  {
    id: 3,
    severity: "Major",
    title: "Function contains excessive complexity",
    file: "src/services/payment.ts",
    line: 126,
    category: "Maintainability",
    description:
      "This function contains multiple nested conditions and has a high cyclomatic complexity.",
    suggestion:
      "Break the function into smaller, focused functions with clear responsibilities.",
  },
  {
    id: 4,
    severity: "Major",
    title: "Missing error handling",
    file: "src/services/user.ts",
    line: 91,
    category: "Reliability",
    description:
      "The asynchronous operation does not properly handle possible failures.",
    suggestion:
      "Add appropriate error handling using try/catch and provide a meaningful fallback.",
  },
  {
    id: 5,
    severity: "Minor",
    title: "Variable naming could be improved",
    file: "src/components/UserCard.tsx",
    line: 34,
    category: "Code Quality",
    description:
      "The variable name does not clearly communicate its purpose.",
    suggestion:
      "Use a descriptive name that explains what the variable represents.",
  },
];

export default function ReviewIssues() {
  const [openIssue, setOpenIssue] = useState<number | null>(1);

  const getSeverityStyles = (severity: string) => {
    if (severity === "Critical") {
      return {
        badge: "bg-red-100 text-red-700",
        icon: "text-red-600",
        background: "bg-red-50",
      };
    }

    if (severity === "Major") {
      return {
        badge: "bg-yellow-100 text-yellow-700",
        icon: "text-yellow-600",
        background: "bg-yellow-50",
      };
    }

    return {
      badge: "bg-blue-100 text-blue-700",
      icon: "text-blue-600",
      background: "bg-blue-50",
    };
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-lg font-bold text-gray-800">
          Issues Found
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Problems detected by the automated code review.
        </p>

      </div>

      <div className="space-y-3">

        {issues.map((issue) => {
          const styles = getSeverityStyles(issue.severity);

          const isOpen = openIssue === issue.id;

          return (
            <div
              key={issue.id}
              className="overflow-hidden rounded-xl border border-gray-200"
            >

              {/* Issue Header */}
              <button
                type="button"
                onClick={() =>
                  setOpenIssue(
                    isOpen ? null : issue.id
                  )
                }
                className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-50"
              >

                <div className="flex min-w-0 items-center gap-3">

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${styles.background}`}
                  >

                    {issue.category === "Security" ? (
                      <ShieldAlert
                        size={20}
                        className={styles.icon}
                      />
                    ) : issue.category === "Reliability" ? (
                      <Bug
                        size={20}
                        className={styles.icon}
                      />
                    ) : (
                      <AlertTriangle
                        size={20}
                        className={styles.icon}
                      />
                    )}

                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles.badge}`}
                      >
                        {issue.severity}
                      </span>

                      <span className="text-xs text-gray-400">
                        {issue.category}
                      </span>

                    </div>

                    <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                      {issue.title}
                    </p>

                  </div>

                </div>

                {isOpen ? (
                  <ChevronUp
                    size={20}
                    className="shrink-0 text-gray-400"
                  />
                ) : (
                  <ChevronDown
                    size={20}
                    className="shrink-0 text-gray-400"
                  />
                )}

              </button>

              {/* Expanded Issue */}
              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">

                  {/* File */}
                  <div className="flex items-center gap-2">

                    <FileCode2
                      size={17}
                      className="text-[#4338CA]"
                    />

                    <span className="text-sm font-medium text-gray-700">
                      {issue.file}
                    </span>

                    <span className="text-xs text-gray-400">
                      Line {issue.line}
                    </span>

                  </div>

                  {/* Description */}
                  <div className="mt-4">

                    <h4 className="text-sm font-semibold text-gray-700">
                      Description
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      {issue.description}
                    </p>

                  </div>

                  {/* Suggestion */}
                  <div className="mt-4 rounded-lg border border-[#4338CA]/10 bg-white p-4">

                    <h4 className="text-sm font-semibold text-[#4338CA]">
                      Suggested Improvement
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {issue.suggestion}
                    </p>

                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-3">

                    <button
                      type="button"
                      className="rounded-lg bg-[#4338CA] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      View Code
                    </button>

                    <button
                      type="button"
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Mark as Reviewed
                    </button>

                  </div>

                </div>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}