"use client";

import { Fragment, useMemo, useState } from "react";
import type { Finding } from "@/lib/api";
import FindingFilters, { type FindingFilterState } from "./FindingFilters";
import FindingDetails from "./FindingDetails";

const PAGE_SIZE = 25;

const severityStyles: Record<Finding["severity"], string> = {
  error: "text-red-600",
  warning: "text-amber-600",
  info: "text-gray-500",
};

/**
 * Dedicated findings section: filter by severity/rule/file, paginate,
 * click a row to expand its full detail. Pagination is client-side over
 * the findings array already embedded in AnalysisResult — analysis-engine
 * doesn't expose a separate paginated findings endpoint, so "don't load
 * thousands of findings unnecessarily" is addressed by only ever
 * *rendering* one page's worth of rows, not by a second network request.
 */
export default function FindingsExplorer({ findings }: { findings: Finding[] }) {
  const [filters, setFilters] = useState<FindingFilterState>({
    severity: "all",
    ruleId: "all",
    fileQuery: "",
  });
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ruleOptions = useMemo(
    () => Array.from(new Set(findings.map((f) => f.rule_id))).sort(),
    [findings]
  );

  const filtered = useMemo(() => {
    return findings.filter((finding) => {
      if (filters.severity !== "all" && finding.severity !== filters.severity) return false;
      if (filters.ruleId !== "all" && finding.rule_id !== filters.ruleId) return false;
      if (
        filters.fileQuery &&
        !finding.file_path.toLowerCase().includes(filters.fileQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [findings, filters]);

  function handleFiltersChange(next: FindingFilterState) {
    setFilters(next);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Findings</h2>

      {findings.length === 0 ? (
        <p className="mt-3 text-gray-500">No findings in this analysis.</p>
      ) : (
        <>
          <div className="mt-4">
            <FindingFilters filters={filters} ruleOptions={ruleOptions} onChange={handleFiltersChange} />
          </div>

          {filtered.length === 0 ? (
            <p className="mt-4 text-gray-500">No findings match the current filters.</p>
          ) : (
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="pb-2 pr-4 font-medium">Severity</th>
                      <th className="pb-2 pr-4 font-medium">Rule</th>
                      <th className="pb-2 pr-4 font-medium">Location</th>
                      <th className="pb-2 font-medium">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((finding) => (
                      <Fragment key={finding.finding_id}>
                        <tr
                          onClick={() =>
                            setExpandedId(expandedId === finding.finding_id ? null : finding.finding_id)
                          }
                          className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className={`py-2 pr-4 font-semibold ${severityStyles[finding.severity]}`}>
                            {finding.severity}
                          </td>
                          <td className="py-2 pr-4 font-mono text-xs text-gray-600">{finding.rule_id}</td>
                          <td className="py-2 pr-4 font-mono text-xs text-gray-600">
                            {finding.file_path}
                            {finding.line ? `:${finding.line}` : ""}
                          </td>
                          <td className="py-2 text-gray-700">{finding.message}</td>
                        </tr>
                        {expandedId === finding.finding_id && (
                          <tr>
                            <td colSpan={4} className="p-0">
                              <FindingDetails finding={finding} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Page {currentPage} of {totalPages} ({filtered.length} finding
                    {filtered.length === 1 ? "" : "s"})
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="rounded-lg border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
