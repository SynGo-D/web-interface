"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import AnalysisDashboard from "@/components/analysis/AnalysisDashboard";
import { LoadingBanner, ErrorBanner, EmptyBanner } from "@/components/analysis/AnalysisStateBanner";
import { getUser } from "@/lib/session";
import { getPullRequestAnalysis, ApiError, type AnalysisResult } from "@/lib/api";

type LoadState =
  | { status: "loading" }
  | { status: "not-authenticated" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ready"; result: AnalysisResult };

export default function AnalysisDetailPage() {
  const params = useParams<{ owner: string; repo: string; number: string }>();
  const { owner, repo, number } = params;
  const pullRequestNumber = Number(number);

  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(() => {
    if (!getUser()) {
      setState({ status: "not-authenticated" });
      return;
    }

    setState({ status: "loading" });

    getPullRequestAnalysis(owner, repo, pullRequestNumber)
      .then((result) => setState({ status: "ready", result }))
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.statusCode === 404) {
          setState({ status: "not-found" });
          return;
        }
        setState({
          status: "error",
          message: error instanceof ApiError ? error.message : "Unable to load analysis results.",
        });
      });
  }, [owner, repo, pullRequestNumber]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/developer/dashboard"
            className="text-sm font-medium text-[#4338CA] hover:underline"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-4">
            {state.status === "loading" && <LoadingBanner message="Loading analysis..." />}

            {state.status === "not-authenticated" && (
              <EmptyBanner message="Sign in to view this repository's analysis." />
            )}

            {state.status === "not-found" && (
              <EmptyBanner message={`Analysis queued or not yet available for ${owner}/${repo} PR #${pullRequestNumber}.`} />
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
