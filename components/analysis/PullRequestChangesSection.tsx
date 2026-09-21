import type { PullRequestChanges } from "@/lib/api";
import MetricCard from "./MetricCard";

const unavailableMessages: Record<NonNullable<PullRequestChanges["unavailable_reason"]>, string> = {
  no_target_branch:
    "This analysis didn't say which branch the pull request targets, so its changes couldn't be worked out.",
  no_merge_base: "The pull request's branch point is too far back in history to compare against.",
  too_large: "This pull request is too large to break down line by line.",
  error: "The pull request's changes couldn't be worked out for this analysis.",
};

const MAX_SYMBOLS_SHOWN = 12;

/**
 * What the pull request itself changed, as opposed to the rest of the
 * dashboard, which describes the whole repository. The changed functions
 * and how many places call them show how far a change can reach.
 */
export default function PullRequestChangesSection({ changes }: { changes: PullRequestChanges }) {
  const symbols = changes.changed_symbols.slice(0, MAX_SYMBOLS_SHOWN);
  const hiddenSymbols = changes.changed_symbols.length - symbols.length;
  const excluded = changes.change_set?.excluded_files.length ?? 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold text-gray-900">In this pull request</h2>
        {changes.change_set && (
          <p className="text-sm text-gray-500">
            compared with <span className="font-mono">{changes.change_set.target_branch}</span>
          </p>
        )}
      </div>

      {changes.unavailable_reason && (
        <p className="mt-3 text-gray-500">{unavailableMessages[changes.unavailable_reason]}</p>
      )}

      {changes.change_set && (
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Files Changed" value={changes.files_changed} />
          <MetricCard label="Lines Added" value={changes.lines_added} />
          <MetricCard label="Lines Removed" value={changes.lines_removed} />
          <MetricCard label="Findings on Changed Lines" value={changes.findings_on_changed_lines} />
        </div>
      )}

      {excluded > 0 && (
        <p className="mt-3 text-sm text-gray-500">
          {excluded} generated file{excluded === 1 ? "" : "s"} (lockfiles, build output) not counted.
        </p>
      )}

      {symbols.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Changed functions</h3>
          <table className="mt-2 w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Location</th>
                <th className="pb-2 font-medium">Known callers</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((symbol) => (
                <tr key={symbol.symbol_id} className="border-t border-gray-100">
                  <td className="py-2 pr-4 font-mono text-xs text-gray-900">{symbol.qualified_name}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-gray-600">
                    {symbol.file_path}:{symbol.start_line}
                  </td>
                  <td className="py-2 text-gray-700">{symbol.callers_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {hiddenSymbols > 0 && (
            <p className="mt-2 text-sm text-gray-500">and {hiddenSymbols} more.</p>
          )}
        </div>
      )}
    </div>
  );
}
