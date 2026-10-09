"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AnalysisResult } from "@/lib/api";
import type { FixJob } from "@/lib/aiTypes";
import { activeJob, aiRequest } from "@/lib/aiSuggestions";

const button =
  "rounded-lg bg-[#4338CA] px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40";

const statusLabels: Record<FixJob["status"], string> = {
  queued: "Queued",
  collecting: "Loading PR and database context",
  generating_suggestion: "Generating suggestions",
  patch_ready: "Ready for review",
  validating: "Validating patch",
  validation_succeeded: "Validation succeeded",
  validation_failed: "Validation failed",
  creating_pull_request: "Creating pull request",
  pull_request_created: "Pull request created, awaiting review",
  already_fixed: "Already fixed or no findings remain",
  failed: "Failed",
  merged: "Fix pull request merged",
};

export default function AiFixPanel({
  result,
  fixing = false,
}: {
  result: AnalysisResult;
  fixing?: boolean;
}) {
  const [job, setJob] = useState<FixJob | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [severity, setSeverity] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [confirmMerge, setConfirmMerge] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const mounted = useRef(true);
  const gate = useRef(false);
  const requestVersion = useRef(0);
  const [owner, repository] = result.repository.split("/");
  const cacheKey = `ai-job:${result.repository}:${result.pull_request_number}:${result.commit_sha}:${fixing}`;
  const busy = pending || activeJob(job);
  const selectionUnavailable = job?.status === "merged" || job?.status === "already_fixed";

  useEffect(() => {
    mounted.current = true;
    const version = requestVersion.current;
    const id = sessionStorage.getItem(cacheKey);
    if (id) {
      aiRequest(`jobs/${id}`)
        .then((data) => {
          if (mounted.current && version === requestVersion.current) setJob(data.job);
        })
        .catch(() => sessionStorage.removeItem(cacheKey));
    }
    return () => {
      mounted.current = false;
    };
  }, [cacheKey]);

  useEffect(() => {
    if (!activeJob(job)) return;
    let current = true;
    const timer = setTimeout(() => {
      aiRequest(`jobs/${job!.id}`)
        .then((data) => {
          if (current) setJob(data.job);
        })
        .catch((err) => {
          if (current) {
            setError(err instanceof Error ? err.message : "Could not refresh job status.");
          }
        });
    }, 2000);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [job]);

  async function run(path: string, body: unknown) {
    if (gate.current) return;
    requestVersion.current++;
    gate.current = true;
    setPending(true);
    setError(null);
    setNotice("");
    try {
      const data = await aiRequest(path, body);
      if (!mounted.current) return;
      setJob(data.job);
      sessionStorage.setItem(cacheKey, data.job.id);
      if (data.duplicate) {
        setNotice("These fixes were already requested, so the existing result is shown.");
      }
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : "Unexpected error.");
      }
    } finally {
      gate.current = false;
      if (mounted.current) setPending(false);
    }
  }

  const generate = (ids: string[]) => {
    if (fixing) setSubmitted(true);
    return run("jobs", {
      owner,
      repository,
      pullRequestNumber: result.pull_request_number,
      headSha: result.commit_sha,
      selectedFindingIds: ids,
    });
  };

  const suggestions = new Map(
    job?.suggestions.map((suggestion) => [suggestion.findingId, suggestion])
  );
  const visibleFindings = severity
    ? result.findings.filter((finding) => finding.severity === severity)
    : result.findings;

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm"
      aria-label={fixing ? "Findings to fix" : "AI suggestions"}
    >
      {!fixing && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">AI suggestions</h2>
              <p className="mt-1 text-sm text-gray-500">
                Suggestions use linter findings, source code, and technical-debt context.
              </p>
            </div>
            <Link
              className="text-sm font-medium text-[#4338CA] hover:underline"
              href={`/developer/ai-fixing?repository=${encodeURIComponent(result.repository)}&pr=${result.pull_request_number}`}
            >
              Open AI Code Fixing →
            </Link>
          </div>
          <p className="my-4 text-sm text-gray-600">
            Review the patch, validate it, and create a separate fix PR. Merging requires explicit confirmation.
          </p>
          <div className="my-4 flex flex-wrap gap-3">
            <button
              className={button}
              disabled={busy || result.status !== "completed" || !result.findings.length}
              onClick={() => generate([])}
            >
              Generate AI suggestions
            </button>
          </div>
          <div aria-live="polite" className="text-sm">
            {pending && <p>Loading…</p>}
            {job && (
              <p className="my-3 font-medium text-indigo-700">{statusLabels[job.status]}</p>
            )}
            {notice && <p className="my-3 text-amber-700">{notice}</p>}
            {error && (
              <p role="alert" className="my-3 rounded-lg bg-red-50 p-3 text-red-700">
                {error}
              </p>
            )}
            {error && job && (
              <button
                className={button}
                disabled={pending}
                onClick={() => run(`jobs/${job.id}`, undefined)}
              >
                Refresh job status
              </button>
            )}
            {job?.error && (
              <p role="alert" className="my-3 text-red-700">
                {job.error.message}
              </p>
            )}
            {job?.status === "failed" && !job.patch && (
              <button
                className={button}
                disabled={busy}
                onClick={() => run(`jobs/${job.id}/retry`, {})}
              >
                Retry job
              </button>
            )}
          </div>
        </>
      )}

      {result.findings.length === 0 && (
        <p className="py-4 text-gray-500">No findings available for this pull request.</p>
      )}

      {fixing && result.findings.length > 0 && !selectionUnavailable && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="p-3 font-medium">Select</th>
                  <th className="p-3 font-medium">
                    <select
                      aria-label="Filter by severity"
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-600 outline-none focus:border-[#4338CA]"
                      value={severity}
                      onChange={(event) => setSeverity(event.target.value)}
                    >
                      <option value="">All severities</option>
                      <option value="error">Error</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                    </select>
                  </th>
                  <th className="p-3 font-medium">Rule / location</th>
                  <th className="p-3 font-medium">Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {visibleFindings.map((finding) => {
                  const suggestion = suggestions.get(finding.finding_id);
                  return (
                    <tr
                      key={finding.finding_id}
                      className="border-t border-gray-100 align-top"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${finding.finding_id}`}
                          disabled={busy || !finding.line}
                          checked={selected.includes(finding.finding_id)}
                          onChange={(event) =>
                            setSelected((previous) =>
                              event.target.checked
                                ? [...previous, finding.finding_id]
                                : previous.filter((id) => id !== finding.finding_id)
                            )
                          }
                        />
                      </td>
                      <td
                        className={`p-3 ${
                          finding.severity === "error"
                            ? "text-red-600"
                            : finding.severity === "warning"
                              ? "text-amber-700"
                              : "text-blue-700"
                        }`}
                      >
                        {finding.severity}
                      </td>
                      <td className="p-3 font-mono text-xs">
                        {finding.rule_id}
                        <br />
                        {finding.file_path}:{finding.line ?? "unknown"}
                      </td>
                      <td className="max-w-xl p-3 leading-6">
                        {suggestion?.explanation ?? finding.message}
                      </td>
                    </tr>
                  );
                })}
                {visibleFindings.length === 0 && (
                  <tr className="border-t border-gray-100">
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      No findings match this severity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              className={button}
              disabled={busy || !selected.length}
              onClick={() => generate(selected)}
            >
              Fix selected ({selected.length})
            </button>
          </div>
          {submitted && (
            <div aria-live="polite" className="mt-3 text-right text-sm">
              {pending && <p className="text-gray-500">Preparing the selected fixes…</p>}
              {!pending && job && (
                <p className="font-medium text-indigo-700">{statusLabels[job.status]}</p>
              )}
              {notice && <p className="mt-2 text-amber-700">{notice}</p>}
              {error && (
                <p role="alert" className="mt-2 text-red-700">
                  {error}
                </p>
              )}
              {job?.error && (
                <p role="alert" className="mt-2 text-red-700">
                  {job.error.message}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {fixing && selectionUnavailable && (
        <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          {job?.status === "merged"
            ? "This fix has been merged. Run a new analysis before selecting any remaining findings."
            : "This pull request is closed, merged, or has no current findings available for AI fixing."}
        </p>
      )}

      {!fixing &&
        job?.suggestions.map((suggestion) => {
          const finding = result.findings.find(
            (item) => item.finding_id === suggestion.findingId
          );
          return (
            <article
              key={suggestion.findingId}
              className="mt-4 rounded-lg border border-gray-200 p-4 text-sm"
            >
              <p className="font-mono text-xs text-gray-500">
                {finding?.file_path}:{finding?.line}
              </p>
              <p className="mt-2 font-medium">{suggestion.explanation}</p>
              <p className="mt-2 text-gray-600">
                Priority: {suggestion.priority} · Severity: {suggestion.severity} · Confidence:{" "}
                {Math.round(suggestion.confidence * 100)}% ·{" "}
                {suggestion.classification.replaceAll("_", " ")}
              </p>
              <p className="mt-2">
                <strong>Technical-debt impact:</strong> {suggestion.debtImpact}
              </p>
              <p className="mt-2 whitespace-pre-wrap">
                <strong>Suggested fix:</strong> {suggestion.suggestedFix}
              </p>
              <p className="mt-2 text-indigo-700">
                {suggestion.fixAvailable ? "Fix available" : "Manual correction needed"}
              </p>
            </article>
          );
        })}

      {fixing && job?.patch && (
        <div className="mt-6">
          <h3 className="font-semibold">Patch preview</h3>
          <p className="my-2 text-sm text-gray-500">
            Files affected: {job.changedFiles.join(", ")}
          </p>
          <pre className="max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
            {job.patch}
          </pre>
          <div className="my-4 flex flex-wrap gap-3">
            <button
              className={button}
              disabled={busy || !!job.pullRequestUrl}
              onClick={() => run(`jobs/${job.id}/validate`, {})}
            >
              Validate patch
            </button>
            <button
              className={button}
              disabled={busy || job.validation?.status !== "passed" || !!job.pullRequestUrl}
              onClick={() => run(`jobs/${job.id}/publish`, {})}
            >
              Create fix pull request
            </button>
          </div>
        </div>
      )}

      {job?.validation && (
        <div className="mt-4 text-sm">
          <h3 className="font-semibold">Validation results: {job.validation.status}</h3>
          <ul className="mt-2 space-y-2">
            {job.validation.checks.map((check, index) => (
              <li key={index}>
                {check.name}: <strong>{check.status}</strong>. {check.details}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fixing && job?.pullRequestUrl && (
        <div className="mt-5 rounded-lg bg-indigo-50 p-4 text-sm">
          <p>
            Fix branch: <code>{job.fixBranch}</code>
          </p>
          <a
            className="mt-2 inline-block font-medium text-indigo-700 underline"
            href={job.pullRequestUrl}
            target="_blank"
            rel="noreferrer"
          >
            View fix PR #{job.createdPullRequestNumber}
          </a>
          {job.status !== "merged" && (
            <>
              <p className="my-3">
                Awaiting review or approval. Repository permissions and branch protection apply.
              </p>
              <button
                className={button}
                disabled={busy || !job.commitSha}
                onClick={() => setConfirmMerge(true)}
              >
                Review merge confirmation
              </button>
            </>
          )}
          {confirmMerge && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Confirm fix merge"
              className="mt-4 rounded-lg border border-indigo-200 bg-white p-4"
            >
              <p>
                Merge fix PR #{job.createdPullRequestNumber} into{" "}
                <strong>{job.targetBranch}</strong>? This updates that branch with the reviewed fix.
              </p>
              <div className="mt-3 flex gap-3">
                <button
                  className={button}
                  disabled={pending}
                  onClick={() => {
                    setConfirmMerge(false);
                    void run(`jobs/${job.id}/merge`, {
                      confirm: true,
                      commitSha: job.commitSha,
                    });
                  }}
                >
                  Confirm merge
                </button>
                <button
                  className="rounded-lg border px-4 py-2"
                  onClick={() => setConfirmMerge(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
