import type { AnalysisResult } from "@/lib/api";

const statusStyles: Record<AnalysisResult["status"], string> = {
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const statusLabels: Record<AnalysisResult["status"], string> = {
  completed: "Completed",
  failed: "Failed",
};

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-gray-900 ${mono ? "font-mono text-sm" : "font-medium"}`}>{value}</p>
    </div>
  );
}

/** Shows only fields analysis-engine actually reports — no fabricated tool version, since it isn't tracked. */
export default function AnalysisHeader({ result }: { result: AnalysisResult }) {
  const timestamp = result.completed_at ?? result.started_at;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">ESLint Code Analysis</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[result.status]}`}>
          {statusLabels[result.status]}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Field label="Repository" value={result.repository} />
        <Field label="Branch" value={result.branch || "—"} mono />
        <Field label="Commit" value={result.commit_sha.slice(0, 12)} mono />
        <Field label="Pull Request" value={`#${result.pull_request_number}`} />
        <Field label="Analyzed" value={new Date(timestamp).toLocaleString()} />
      </div>
    </div>
  );
}
