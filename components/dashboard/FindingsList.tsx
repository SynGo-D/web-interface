import type { AnalysisResult } from "@/lib/api";

/**
 * Renders one repository's analysis history (most-recent PR run first).
 * Shared between wherever findings need to show up — currently the
 * developer dashboard — so the table markup exists in exactly one place.
 */
export default function FindingsList({ results }: { results: AnalysisResult[] }) {
  if (results.length === 0) {
    return (
      <p className="text-gray-500">
        No analysis results yet. Findings appear here once a pull request is
        opened and processed on this repository.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {results.map((result) => (
        <div key={result.result_id}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              PR #{result.pull_request_number}
              <span className="ml-2 font-mono text-sm text-gray-400">
                {result.commit_sha.slice(0, 12)}
              </span>
            </h3>
            <span
              className={`text-sm font-semibold ${
                result.status === "completed" ? "text-green-600" : "text-red-600"
              }`}
            >
              {result.status} — {result.findings.length} finding
              {result.findings.length === 1 ? "" : "s"}
            </span>
          </div>

          {result.findings.length > 0 && (
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="pb-2 pr-4 font-medium">Severity</th>
                  <th className="pb-2 pr-4 font-medium">Location</th>
                  <th className="pb-2 pr-4 font-medium">Tool</th>
                  <th className="pb-2 font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {result.findings.map((finding) => (
                  <tr key={finding.finding_id} className="border-t border-gray-100">
                    <td className="py-2 pr-4">
                      <span
                        className={
                          finding.severity === "error"
                            ? "text-red-600"
                            : finding.severity === "warning"
                            ? "text-amber-600"
                            : "text-gray-500"
                        }
                      >
                        {finding.severity}
                      </span>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-gray-600">
                      {finding.file_path}
                      {finding.line ? `:${finding.line}` : ""}
                    </td>
                    <td className="py-2 pr-4 text-gray-500">{finding.tool}</td>
                    <td className="py-2 text-gray-700">{finding.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
