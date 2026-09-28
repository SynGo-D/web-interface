import type { Finding } from "@/lib/api";

const severityStyles: Record<Finding["severity"], string> = {
  error: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-gray-100 text-gray-600",
};

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-gray-900 ${mono ? "font-mono text-sm" : ""}`}>{value}</p>
    </div>
  );
}

/**
 * Expanded detail for one finding. No source-code snippet is rendered —
 * analysis-engine's Finding model doesn't carry one, and this component
 * doesn't assume it exists.
 */
export default function FindingDetails({ finding }: { finding: Finding }) {
  return (
    <div className="grid grid-cols-1 gap-4 border-t border-gray-100 bg-gray-50 p-4 sm:grid-cols-2">
      <Field label="Rule" value={finding.rule_id} mono />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Severity</p>
        <span
          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${severityStyles[finding.severity]}`}
        >
          {finding.severity}
        </span>
      </div>
      <div className="sm:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Message</p>
        <p className="mt-1 text-gray-900">{finding.message}</p>
      </div>
      <Field label="File" value={finding.file_path} mono />
      <Field
        label="Location"
        value={finding.line ? `Line ${finding.line}, Column ${finding.column ?? "—"}` : "N/A"}
      />
    </div>
  );
}
