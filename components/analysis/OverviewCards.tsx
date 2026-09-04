import type { AnalysisMetrics } from "@/lib/api";
import MetricCard from "./MetricCard";

/** Top-line overview tiles — every value comes straight off AnalysisMetrics, never recomputed. */
export default function OverviewCards({ metrics }: { metrics: AnalysisMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <MetricCard label="Files Analyzed" value={metrics.files_analyzed} />
      <MetricCard label="Lines of Code" value={metrics.loc.toLocaleString()} />
      <MetricCard label="Errors" value={metrics.errors} />
      <MetricCard label="Warnings" value={metrics.warnings} />
      <MetricCard label="Total Issues" value={metrics.total_issues} />
      <MetricCard
        label="Issue Density"
        value={metrics.issue_density.toFixed(2)}
        hint="issues / KLOC"
      />
    </div>
  );
}
