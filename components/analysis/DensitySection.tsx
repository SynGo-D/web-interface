import type { AnalysisMetrics } from "@/lib/api";
import MetricCard from "./MetricCard";

/** Density figures come straight off AnalysisMetrics — never recalculated as issues / (loc / 1000) here. */
export default function DensitySection({ metrics }: { metrics: AnalysisMetrics }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Issue Density</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Error Density"
          value={metrics.error_density.toFixed(2)}
          hint="issues / KLOC"
        />
        <MetricCard
          label="Warning Density"
          value={metrics.warning_density.toFixed(2)}
          hint="issues / KLOC"
        />
        <MetricCard
          label="Issue Density"
          value={metrics.issue_density.toFixed(2)}
          hint="issues / KLOC"
        />
      </div>
    </div>
  );
}
