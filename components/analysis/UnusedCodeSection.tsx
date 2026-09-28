import type { UnusedCodeMetrics } from "@/lib/api";
import MetricCard from "./MetricCard";

/**
 * "Unused Code Findings" — deliberately not described as memory leaks;
 * these are dead source (unused variables, unreachable branches), not a
 * runtime memory diagnosis.
 */
export default function UnusedCodeSection({ unusedCode }: { unusedCode: UnusedCodeMetrics }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Unused Code Findings</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard label="Unused Variables" value={unusedCode.unused_variables} />
        <MetricCard label="Unreachable Code" value={unusedCode.unreachable_code} />
      </div>
    </div>
  );
}
