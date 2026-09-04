import type { CognitiveComplexityMetrics, ComplexityMetrics } from "@/lib/api";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 py-2 first:border-t-0 first:pt-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

const dash = (value: number | null) => (value === null ? "—" : value);

/**
 * Cyclomatic and cognitive complexity are two distinct metrics — shown as
 * two clearly-labeled, side-by-side sub-cards, never merged into one
 * score. Both `average`/`maximum` can be `null` (no violating
 * function/file exists), rendered as "—" rather than a misleading 0.
 */
export default function ComplexitySection({
  complexity,
  cognitiveComplexity,
}: {
  complexity: ComplexityMetrics;
  cognitiveComplexity: CognitiveComplexityMetrics;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900">Complexity</h2>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Cyclomatic Complexity
          </h3>
          <div className="mt-2">
            <Stat label="Average" value={dash(complexity.average)} />
            <Stat label="Maximum" value={dash(complexity.maximum)} />
            <Stat label="Violations" value={complexity.violations} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Cognitive Complexity
          </h3>
          <div className="mt-2">
            <Stat label="Average" value={dash(cognitiveComplexity.average)} />
            <Stat label="Maximum" value={dash(cognitiveComplexity.maximum)} />
            <Stat label="Violations" value={cognitiveComplexity.violations} />
          </div>
        </div>
      </div>
    </div>
  );
}
