import type { AgentFinding, AgentReview } from "@/lib/api";

// Everything written by the model is rendered as plain React text (never
// dangerouslySetInnerHTML): the PR under review could have steered the
// model into producing markup.

const riskStyles: Record<NonNullable<AgentReview["risk_level"]>, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const severityStyles: Record<AgentFinding["severity"], string> = {
  high: "text-red-600",
  medium: "text-amber-600",
  low: "text-gray-500",
};

const skipMessages: Record<NonNullable<AgentReview["skip_reason"]>, string> = {
  disabled: "AI review isn't enabled for this analysis.",
  no_diff: "AI review needs the pull request's changes, which couldn't be worked out for this analysis.",
  too_large: "This pull request is too large for an AI review.",
  no_changes: "Nothing reviewable changed in this pull request.",
};

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">{children}</div>;
}

/**
 * The AI review: what the PR does, the few issues worth attention, and
 * which linter findings matter for this change. Every issue shows the
 * evidence the engine checked against the code.
 */
export default function AiReviewSection({ review }: { review: AgentReview }) {
  if (review.status === "running" || review.status === "pending") {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-gray-900">AI review</h2>
        <p className="mt-3 text-gray-500">AI review in progress. Linter results below are already complete.</p>
      </Panel>
    );
  }

  if (review.status === "skipped" || review.status === "failed") {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-gray-900">AI review</h2>
        <p className="mt-3 text-gray-500">
          {review.status === "skipped" && review.skip_reason
            ? skipMessages[review.skip_reason]
            : "The AI review couldn't be completed this time. Linter results are unaffected."}
        </p>
      </Panel>
    );
  }

  const stats = review.stats;

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">AI review</h2>
        {review.risk_level && (
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${riskStyles[review.risk_level]}`}>
            Risk: {review.risk_level}
          </span>
        )}
      </div>

      {review.summary && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">What this PR does</h3>
          <p className="mt-1 whitespace-pre-line text-gray-800">{review.summary}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Needs attention</h3>
        {review.findings.length === 0 ? (
          <p className="mt-1 text-gray-500">No issues found beyond the linter report.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {review.findings.map((finding) => (
              <li key={finding.finding_id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-gray-900">
                    <span className={`mr-2 uppercase ${severityStyles[finding.severity]}`}>{finding.severity}</span>
                    {finding.title}
                  </p>
                  <span className="font-mono text-xs text-gray-600">
                    {finding.file_path}:{finding.line_start}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {finding.category} · {Math.round(finding.confidence * 100)}% confidence ·{" "}
                  {finding.verification === "verified" ? "verified" : "evidence checked"}
                </p>
                <p className="mt-2 whitespace-pre-line text-gray-700">{finding.explanation}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {finding.evidence.map((item, index) => (
                    <span
                      key={`${item.type}-${index}`}
                      title={item.quote ?? undefined}
                      className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600"
                    >
                      {item.verified ? "✓ " : ""}
                      {item.ref}
                    </span>
                  ))}
                </div>
                {finding.suggested_fix && (
                  <pre className="mt-3 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
                    {finding.suggested_fix}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {review.linter_triage.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Linter findings that matter here
          </h3>
          <ul className="mt-2 space-y-2">
            {review.linter_triage.map((item) => (
              <li key={item.fingerprint} className="text-sm">
                <span className={`mr-2 font-semibold uppercase ${severityStyles[item.importance]}`}>
                  {item.importance}
                </span>
                <span className="font-mono text-xs text-gray-600">
                  {item.rule_id} · {item.file_path}
                  {item.line ? `:${item.line}` : ""}
                </span>
                <p className="mt-0.5 text-gray-700">{item.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stats && (
        <p className="mt-6 text-xs text-gray-400">
          {stats.model} · {(stats.duration_ms / 1000).toFixed(1)}s ·{" "}
          {stats.cost_usd !== null ? `$${stats.cost_usd.toFixed(4)}` : "cost unknown"} ·{" "}
          {stats.candidates_dropped} of {stats.candidates_proposed} suggested issue
          {stats.candidates_proposed === 1 ? "" : "s"} dropped for lack of evidence
        </p>
      )}
    </Panel>
  );
}
