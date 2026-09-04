"use client";

import { useMemo, useState } from "react";
import type { FileStatistic } from "@/lib/api";

type SortKey = "file_path" | "loc" | "errors" | "warnings" | "issues";

const columns: { key: SortKey; label: string }[] = [
  { key: "file_path", label: "File" },
  { key: "loc", label: "LOC" },
  { key: "errors", label: "Errors" },
  { key: "warnings", label: "Warnings" },
  { key: "issues", label: "Issues" },
];

/** Sortable + searchable per-file table. Filtering/sorting happen entirely client-side over the already-fetched file_statistics array. */
export default function FileStatisticsTable({ fileStatistics }: { fileStatistics: FileStatistic[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("issues");
  const [ascending, setAscending] = useState(false);

  const filtered = useMemo(
    () => fileStatistics.filter((file) => file.file_path.toLowerCase().includes(query.toLowerCase())),
    [fileStatistics, query]
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const result =
        sortKey === "file_path" ? a.file_path.localeCompare(b.file_path) : a[sortKey] - b[sortKey];
      return ascending ? result : -result;
    });
    return copy;
  }, [filtered, sortKey, ascending]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setAscending((prev) => !prev);
    } else {
      setSortKey(key);
      setAscending(key === "file_path");
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">File Statistics</h2>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by filename…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none transition focus:border-[#4338CA] sm:w-64"
        />
      </div>

      {fileStatistics.length === 0 ? (
        <p className="mt-3 text-gray-500">No analyzed files.</p>
      ) : sorted.length === 0 ? (
        <p className="mt-3 text-gray-500">No files match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
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
              {sorted.map((file) => (
                <tr key={file.file_path} className="border-t border-gray-100">
                  <td className="py-2 pr-4 font-mono text-xs text-gray-700">{file.file_path}</td>
                  <td className="py-2 pr-4 text-gray-900">{file.loc.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-red-600">{file.errors}</td>
                  <td className="py-2 pr-4 text-amber-600">{file.warnings}</td>
                  <td className="py-2 pr-4 font-semibold text-gray-900">{file.issues}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
