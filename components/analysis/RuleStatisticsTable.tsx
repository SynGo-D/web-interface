"use client";

import { useMemo, useState } from "react";
import type { RuleStatistic } from "@/lib/api";

type SortKey = "rule_id" | "count" | "errors" | "warnings";

const columns: { key: SortKey; label: string }[] = [
  { key: "rule_id", label: "Rule" },
  { key: "count", label: "Count" },
  { key: "errors", label: "Errors" },
  { key: "warnings", label: "Warnings" },
];

/** Sortable table of per-rule finding counts, returned by analysis-engine as-is (no client-side aggregation). */
export default function RuleStatisticsTable({ ruleStatistics }: { ruleStatistics: RuleStatistic[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [ascending, setAscending] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...ruleStatistics];
    copy.sort((a, b) => {
      const result =
        sortKey === "rule_id" ? a.rule_id.localeCompare(b.rule_id) : a[sortKey] - b[sortKey];
      return ascending ? result : -result;
    });
    return copy;
  }, [ruleStatistics, sortKey, ascending]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAscending((prev) => !prev);
    } else {
      setSortKey(key);
      setAscending(key === "rule_id");
    }
  }

  if (ruleStatistics.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Rule Distribution</h2>
        <p className="mt-3 text-gray-500">No rule violations in this analysis.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Rule Distribution</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="text-gray-400">
              {columns.map((column) => (
                <th key={column.key} className="pb-2 pr-4 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    {column.label}
                    {sortKey === column.key && <span>{ascending ? "▲" : "▼"}</span>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((rule) => (
              <tr key={rule.rule_id} className="border-t border-gray-100">
                <td className="py-2 pr-4 font-mono text-xs text-gray-700">{rule.rule_id}</td>
                <td className="py-2 pr-4 text-gray-900">{rule.count}</td>
                <td className="py-2 pr-4 text-red-600">{rule.errors}</td>
                <td className="py-2 pr-4 text-amber-600">{rule.warnings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
