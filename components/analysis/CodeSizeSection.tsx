import type { SizeMetrics } from "@/lib/api";

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 py-2 first:border-t-0 first:pt-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

export default function CodeSizeSection({ size }: { size: SizeMetrics }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Code Size</h2>
      <div className="mt-4">
        <Row label="Largest File" value={`${size.largest_file_lines.toLocaleString()} lines`} />
        <Row
          label="Largest Function"
          value={size.largest_function_lines === null ? "—" : `${size.largest_function_lines} lines`}
        />
        <Row label="File Size Violations" value={size.max_lines_violations} />
        <Row label="Function Size Violations" value={size.max_lines_per_function_violations} />
      </div>
    </div>
  );
}
