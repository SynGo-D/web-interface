import type { AnalysisResult } from "@/lib/api";
import AnalysisHeader from "./AnalysisHeader";
import OverviewCards from "./OverviewCards";
import ComplexitySection from "./ComplexitySection";
import DensitySection from "./DensitySection";
import CodeSizeSection from "./CodeSizeSection";
import UnusedCodeSection from "./UnusedCodeSection";
import RuleStatisticsTable from "./RuleStatisticsTable";
import FileStatisticsTable from "./FileStatisticsTable";
import FindingsExplorer from "./FindingsExplorer";

/**
 * Composes one AnalysisResult into the full dashboard. A "failed" result
 * only ever shows the header + error banner — its metrics/findings are
 * never rendered as if they were a complete picture, since a failed
 * ESLint run doesn't produce trustworthy aggregates.
 */
export default function AnalysisDashboard({ result }: { result: AnalysisResult }) {
  if (result.status === "failed") {
    return (
      <div className="space-y-6">
        <AnalysisHeader result={result} />
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-700">Analysis failed</h2>
          <p className="mt-2 text-red-700">
            {result.error_message ?? "The analyzer did not report a specific error."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalysisHeader result={result} />
      <OverviewCards metrics={result.metrics} />
      <ComplexitySection
        complexity={result.metrics.complexity}
        cognitiveComplexity={result.metrics.cognitive_complexity}
      />
      <DensitySection metrics={result.metrics} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CodeSizeSection size={result.metrics.size} />
        <UnusedCodeSection unusedCode={result.metrics.unused_code} />
      </div>
      <RuleStatisticsTable ruleStatistics={result.rule_statistics} />
      <FileStatisticsTable fileStatistics={result.file_statistics} />
      <FindingsExplorer findings={result.findings} />
    </div>
  );
}
