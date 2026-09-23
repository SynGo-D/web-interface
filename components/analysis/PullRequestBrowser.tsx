"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AnalysisDashboard from "./AnalysisDashboard";
import { EmptyBanner, ErrorBanner, LoadingBanner } from "./AnalysisStateBanner";
import {
  ApiError,
  getPullRequestAnalysis,
  getRepositoryAnalysis,
  listIntegrations,
  type AnalysisResult,
  type Integration,
} from "@/lib/api";

const POLL_MS = 5_000;
const HISTORY_LIMIT = 50;

type PullRequest = { number: number; branch: string; analyzedAt: string; status: AnalysisResult["status"] };

function repositoryOf(integration: Integration): string {
  return `${integration.repositoryOwner}/${integration.repositoryName}`;
}

/**
 * Pick a connected repository, then one of its analysed pull requests, and
 * read that PR's review. The repository list comes from the user's own
 * integrations; the pull requests are whichever ones have been analysed.
 */
export default function PullRequestBrowser({ organizationId, projectId }: {
  organizationId?: string;
  projectId?: string;
} = {}) {
  const [integrations, setIntegrations] = useState<Integration[] | null>(null);
  const [repository, setRepository] = useState<string>("");
  const [pullRequests, setPullRequests] = useState<PullRequest[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const message = useCallback(
    (err: unknown, fallback: string) => setError(err instanceof ApiError ? err.message : fallback),
    []
  );

  // Connected repositories.
  useEffect(() => {
    let current = true;
    listIntegrations(organizationId, projectId)
      .then((all) => {
        if (!current) return;
        const connected = all.filter((i) => i.status === "ACTIVE");
        setIntegrations(connected);
        setRepository((previous) => previous || (connected[0] ? repositoryOf(connected[0]) : ""));
      })
      .catch((err) => current && message(err, "Couldn't load your repositories."));
    return () => {
      current = false;
    };
  }, [organizationId, projectId, message]);

  // The chosen repository's analysed pull requests, newest run per PR.
  const showPullRequests = useCallback((results: AnalysisResult[]) => {
    const newestPerPr = new Map<number, PullRequest>();
    for (const run of results) {
      if (!newestPerPr.has(run.pull_request_number)) {
        newestPerPr.set(run.pull_request_number, {
          number: run.pull_request_number,
          branch: run.branch,
          analyzedAt: run.completed_at ?? run.started_at,
          status: run.status,
        });
      }
    }
    const list = [...newestPerPr.values()].sort((a, b) => b.number - a.number);
    setPullRequests(list);
    setSelected((previous) =>
      previous !== null && list.some((pr) => pr.number === previous) ? previous : list[0]?.number ?? null
    );
    setError(null);
  }, []);

  useEffect(() => {
    if (!repository) return;
    const [owner, name] = repository.split("/");
    let current = true;
    getRepositoryAnalysis(owner, name, HISTORY_LIMIT)
      .then((results) => current && showPullRequests(results))
      .catch((err) => current && message(err, "Couldn't load this repository's pull requests."));
    return () => {
      current = false;
    };
  }, [repository, showPullRequests, message]);

  // The selected pull request's full analysis.
  const loadResult = useCallback(
    (repo: string, number: number) => {
      const [owner, name] = repo.split("/");
      return getPullRequestAnalysis(owner, name, number)
        .then((analysis) => {
          setResult(analysis);
          setError(null);
        })
        .catch((err) => {
          setResult(null);
          message(err, "Couldn't load this pull request's analysis.");
        });
    },
    [message]
  );

  useEffect(() => {
    if (!repository || selected === null) return;
    const [owner, name] = repository.split("/");
    let current = true;
    getPullRequestAnalysis(owner, name, selected)
      .then((analysis) => {
        if (!current) return;
        setResult(analysis);
        setError(null);
      })
      .catch((err) => {
        if (!current) return;
        setResult(null);
        message(err, "Couldn't load this pull request's analysis.");
      });
    return () => {
      current = false;
    };
  }, [repository, selected, message]);

  // While a review is still running, keep the page up to date on its own.
  const reviewRunning = result?.review?.status === "running" || result?.review?.status === "pending";

  useEffect(() => {
    if (!reviewRunning || !repository || selected === null) return;
    const timer = setTimeout(() => loadResult(repository, selected), POLL_MS);
    return () => clearTimeout(timer);
  }, [reviewRunning, result, repository, selected, loadResult]);

  const selectedPr = useMemo(
    () => pullRequests?.find((pr) => pr.number === selected) ?? null,
    [pullRequests, selected]
  );

  if (integrations !== null && integrations.length === 0) {
    return (
      <EmptyBanner message="No repositories in this project yet. Add one from Repositories to see its pull requests." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <label className="text-sm">
              <span className="block font-medium text-gray-700">Repository</span>
              <select
                value={repository}
                onChange={(event) => {
                  // Cleared here rather than in an effect: switching
                  // repository is a user action, and the old repository's
                  // pull requests must not linger while the new ones load.
                  setRepository(event.target.value);
                  setSelected(null);
                  setPullRequests(null);
                  setResult(null);
                }}
                className="mt-1 min-w-[240px] rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA]"
              >
                {(integrations ?? []).map((integration) => (
                  <option key={integration.id} value={repositoryOf(integration)}>
                    {repositoryOf(integration)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="block font-medium text-gray-700">Pull request</span>
              <select
                value={selected ?? ""}
                disabled={!pullRequests || pullRequests.length === 0}
                onChange={(event) => setSelected(Number(event.target.value))}
                className="mt-1 min-w-[280px] rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA] disabled:bg-gray-100"
              >
                {pullRequests === null && <option value="">Loading…</option>}
                {pullRequests?.length === 0 && <option value="">No analysed pull requests yet</option>}
                {pullRequests?.map((pr) => (
                  <option key={pr.number} value={pr.number}>
                    #{pr.number} · {pr.branch || "unknown branch"} ·{" "}
                    {new Date(pr.analyzedAt).toLocaleString()}
                    {pr.status === "failed" ? " · analysis failed" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {repository && (
            <Link
              href={`/developer/rules/${repository}`}
              className="text-sm font-medium text-[#4338CA] hover:underline"
            >
              Business rules →
            </Link>
          )}
        </div>

        {selectedPr && (
          <p className="mt-3 text-sm text-gray-500">
            Showing the most recent analysis of {repository} PR #{selectedPr.number}.
            {reviewRunning && " The AI review is still running; this page updates on its own."}
          </p>
        )}
      </div>

      {error && <ErrorBanner message={error} />}
      {!error && integrations === null && <LoadingBanner message="Loading your repositories..." />}
      {!error && integrations !== null && pullRequests?.length === 0 && (
        <EmptyBanner message={`No pull request of ${repository} has been analysed yet.`} />
      )}
      {!error && selected !== null && !result && <LoadingBanner message="Loading analysis..." />}
      {!error && result && <AnalysisDashboard result={result} />}
    </div>
  );
}
