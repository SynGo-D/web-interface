"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import AnalysisDashboard from "@/components/analysis/AnalysisDashboard";
import { LoadingBanner, ErrorBanner, EmptyBanner } from "@/components/analysis/AnalysisStateBanner";
import { isSignedIn, signedInUnknown, subscribeToSession } from "@/lib/session";
import { getPullRequestAnalysis, ApiError, type AnalysisResult } from "@/lib/api";

const POLL_MS = 5_000;

type LoadState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ready"; result: AnalysisResult };

export default function AnalysisDetailPage() {
  const params = useParams<{ owner: string; repo: string; number: string }>();
  const { owner, repo, number } = params;
  const pullRequestNumber = Number(number);

  const [state, setState] = useState<LoadState>({ status: "loading" });
  // The session lives in browser storage: unknown (null) while rendering
  // on the server, read directly on the client.
  const signedIn = useSyncExternalStore(subscribeToSession, isSignedIn, signedInUnknown);

  const apply = useCallback((result: AnalysisResult) => setState({ status: "ready", result }), []);

  const applyError = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.statusCode === 404) {
      // The webhook arrived but the analysis isn't stored yet, or this PR
      // was never analyzed. Either way, keep checking.
      setState({ status: "not-found" });
      return;
    }
    setState({
      status: "error",
      message: error instanceof ApiError ? error.message : "Unable to load analysis results.",
    });
  }, []);

  const load = useCallback(
    () => getPullRequestAnalysis(owner, repo, pullRequestNumber).then(apply).catch(applyError),
    [owner, repo, pullRequestNumber, apply, applyError]
  );

  useEffect(() => {
    if (!signedIn) return;
    let current = true;
    getPullRequestAnalysis(owner, repo, pullRequestNumber)
      .then((result) => current && apply(result))
      .catch((error) => current && applyError(error));
    return () => {
      current = false;
    };
  }, [owner, repo, pullRequestNumber, signedIn, apply, applyError]);

  // An analysis takes a few seconds and its AI review up to a minute, so
  // the page follows along instead of making the reader reload: while the
  // result hasn't arrived, or its review is still running.
  const waiting =
    state.status === "not-found" ||
    (state.status === "ready" &&
      (state.result.review?.status === "running" || state.result.review?.status === "pending"));

  useEffect(() => {
    if (!waiting || !signedIn) return;
    const timer = setTimeout(load, POLL_MS);
    return () => clearTimeout(timer);
  }, [waiting, signedIn, state, load]);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/developer/dashboard"
              className="text-sm font-medium text-[#4338CA] hover:underline"
            >
              ← Back to dashboard
            </Link>
            <Link
              href={`/developer/rules/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`}
              className="text-sm font-medium text-[#4338CA] hover:underline"
            >
              Business rules →
            </Link>
          </div>

          <div className="mt-4">
            {signedIn !== false && state.status === "loading" && <LoadingBanner message="Loading analysis..." />}

            {signedIn === false && (
              <EmptyBanner message="Sign in to view this repository's analysis." />
            )}

            {state.status === "not-found" && (
              <EmptyBanner
                message={`Waiting for the analysis of ${owner}/${repo} PR #${pullRequestNumber}. This page updates on its own.`}
              />
            )}

            {state.status === "error" && (
              <ErrorBanner message={state.message} onRetry={load} />
            )}

            {state.status === "ready" && <AnalysisDashboard result={state.result} />}
          </div>
        </div>
      </main>
    </div>
  );
}
