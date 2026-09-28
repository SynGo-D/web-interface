"use client";

export interface FindingFilterState {
  severity: "all" | "error" | "warning" | "info";
  ruleId: string;
  fileQuery: string;
}

/** Filter controls for FindingsExplorer — owns no data of its own, purely emits the next filter state. */
export default function FindingFilters({
  filters,
  ruleOptions,
  onChange,
}: {
  filters: FindingFilterState;
  ruleOptions: string[];
  onChange: (next: FindingFilterState) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <select
        value={filters.severity}
        onChange={(event) =>
          onChange({ ...filters, severity: event.target.value as FindingFilterState["severity"] })
        }
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA]"
      >
        <option value="all">All severities</option>
        <option value="error">Error</option>
        <option value="warning">Warning</option>
        <option value="info">Info</option>
      </select>

      <select
        value={filters.ruleId}
        onChange={(event) => onChange({ ...filters, ruleId: event.target.value })}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA]"
      >
        <option value="all">All rules</option>
        {ruleOptions.map((rule) => (
          <option key={rule} value={rule}>
            {rule}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={filters.fileQuery}
        onChange={(event) => onChange({ ...filters, fileQuery: event.target.value })}
        placeholder="Filter by file path…"
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA] sm:min-w-[220px]"
      />
    </div>
  );
}
