/**
 * Generic KPI tile — the single building block behind OverviewCards,
 * DensitySection, and anywhere else a labeled number needs to show up.
 * Purely presentational: every value it renders is passed in already
 * computed (see lib/api.ts's AnalysisMetrics) — this component never
 * derives a number itself.
 */
export default function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
