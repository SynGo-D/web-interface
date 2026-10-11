"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AnalysisResult } from "@/lib/api";
import type { SuggestionJob } from "@/lib/aiTypes";
import { activeSuggestionJob, aiRequest } from "@/lib/aiSuggestions";

const button =
  "rounded-lg bg-[#4338CA] px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40";

const statusLabels: Record<SuggestionJob["status"], string> = {
  queued: "Queued",
  collecting: "Loading PR and database context",
  generating_suggestion: "Generating suggestions",
  patch_ready: "Suggestions ready",
  already_fixed: "No current findings remain",
  failed: "Failed",
};

export default function AiFixPanel({
  result,
  standalone = false,
}: {
  result: AnalysisResult;
  standalone?: boolean;
}) {
  const [job, setJob] = useState<SuggestionJob | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const mounted = useRef(true);
  const gate = useRef(false);
  const requestVersion = useRef(0);
  const [owner, repository] = result.repository.split("/");
  const cacheKey = `ai-suggestion-job:${result.repository}:${result.pull_request_number}:${result.commit_sha}`;
  const busy = pending || activeSuggestionJob(job);

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
    if (!activeSuggestionJob(job)) return;
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
        setNotice("These suggestions were already requested, so the existing result is shown.");
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

  const generate = () => run("jobs", {
    owner,
    repository,
    pullRequestNumber: result.pull_request_number,
    headSha: result.commit_sha,
    selectedFindingIds: [],
  });

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm"
      aria-label="AI suggestions"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">AI suggestions</h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate explanations and recommended corrections from the analysis and technical-debt context.
          </p>
        </div>
        {!standalone && (
          <Link
            className="text-sm font-medium text-[#4338CA] hover:underline"
            href={`/developer/ai-fixing?repository=${encodeURIComponent(result.repository)}&pr=${result.pull_request_number}`}
          >
            Open AI Code Suggestion →
          </Link>
        )}
      </div>

      <p className="my-4 text-sm text-gray-600">
        This feature provides suggestions only. It does not modify code or create pull requests.
      </p>

      {result.findings.length === 0 ? (
        <p className="py-4 text-gray-500">No findings available for this pull request.</p>
      ) : (
        <div className="my-4 flex flex-wrap gap-3">
          <button
            className={button}
            disabled={busy || result.status !== "completed"}
            onClick={() => void generate()}
          >
            Generate AI suggestions
          </button>
        </div>
      )}

      <div aria-live="polite" className="text-sm">
        {pending && <p>Loading…</p>}
        {job && <p className="my-3 font-medium text-indigo-700">{statusLabels[job.status]}</p>}
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
            onClick={() => void run(`jobs/${job.id}`, undefined)}
          >
            Refresh job status
          </button>
        )}
        {job?.error && (
          <div role="alert" className="my-3 text-red-700">
            <p>{job.error.message}</p>
            <p className="mt-1 font-mono text-xs">Job ID: {job.id}</p>
          </div>
        )}
        {job?.status === "failed" && (
          <button
            className={button}
            disabled={busy}
            onClick={() => void run(`jobs/${job.id}/retry`, {})}
          >
            Retry suggestions
          </button>
        )}
      </div>

      {job?.suggestions.map((suggestion) => {
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
              <strong>Suggested correction:</strong> {suggestion.suggestedFix}
            </p>
          </article>
        );
      })}
    </section>
  );
}
