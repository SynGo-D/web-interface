"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Inbox,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  TechnicalDebtApiError,
  calculatePullRequestDebt,
  getDebtSummary,
  type DebtSummary,
} from "@/lib/technicalDebtApi";
import { connectedRepositories, listProjects } from "@/lib/api";
import { getWorkspace, noWorkspace, subscribeToWorkspace } from "@/lib/workspace";
import { allows } from "@/lib/capabilities";
import DebtBreakdown from "./DebtBreakdown";
import DebtControls from "./DebtControls";
import DebtHeader from "./DebtHeader";
import DebtIssueList from "./DebtIssueList";
import DebtSummaryCards from "./DebtSummaryCards";
import DebtTrendChart from "./DebtTrendChart";
import PullRequestDebtTable from "./PullRequestDebtTable";

type View =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "ready"; summary: DebtSummary };

type Notice = { kind: "success" | "error"; message: string };

const messageOf = (e: unknown) =>
  e instanceof Error ? e.message : "Unexpected error";

/*
"owner/name" for each connected repository of the current project. Empty
when no project is selected, which leaves the field free-typed rather than
blocking — the repository name is the only thing the debt routes need, and
a suggestion list is a convenience, not a gate.
*/
async function listRepositoriesForWorkspace(): Promise<string[]> {
  const workspace = getWorkspace();
  if (!workspace) return [];

  const projects = await listProjects(workspace.organizationId);
  const project = projects.find((p) => p.id === workspace.projectId);
  if (!project) return [];

  return connectedRepositories(project).map(
    (r) => `${r.repositoryOwner}/${r.repositoryName}`
  );
}

export default function DebtDashboard() {

  const [repositories, setRepositories] = useState<string[]>([]);
  const [repository, setRepository] = useState("");
  const [view, setView] = useState<View>({ status: "loading" });
  const [calculating, setCalculating] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Ignore a summary response if the user has since switched repository.
  const latestRepository = useRef("");

  // A manager reads the debt; calculating it spends on two AI calls per
  // finding, which the roles table gives to developers and administrators.
  const workspace = useSyncExternalStore(subscribeToWorkspace, getWorkspace, noWorkspace);
  const mayCalculate = allows(workspace?.role, "debtAndFixes");

  const loadSummary = useCallback(async (repo: string) => {
    latestRepository.current = repo;

    try {
      const summary = await getDebtSummary(repo);
      if (latestRepository.current === repo) {
        setView({ status: "ready", summary });
      }
    } catch (e) {
      if (latestRepository.current !== repo) return;
      setView(
        e instanceof TechnicalDebtApiError && e.status === 404
          ? { status: "empty" }
          : { status: "error", message: messageOf(e) }
      );
    }
  }, []);

  /*
  The suggestions come from the project the user is working in, not from
  "every repository that has debt data". The debt service can answer the
  latter, but only by listing other organisations' repositories to whoever
  asks — it has no notion of tenancy. Asking the project instead is both
  scoped by construction and more useful: it suggests the repositories of
  the project in front of you.

  State is only set in the promise callbacks, never synchronously.
  */
  const loadRepositories = useCallback(
    () =>
      listRepositoriesForWorkspace().then(
        (repositories) => {
          setRepositories(repositories);

          // ?repo=owner/name preselects a repository.
          const initial =
            new URLSearchParams(window.location.search).get("repo") ??
            repositories[0] ??
            "";

          setRepository(initial);

          if (initial) {
            return loadSummary(initial);
          }

          setView({ status: "empty" });
        },
        (e) => setView({ status: "error", message: messageOf(e) })
      ),
    [loadSummary]
  );

  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  const changeRepository = (repo: string) => {
    setRepository(repo);
    setNotice(null);
    setView({ status: "loading" });
    void loadSummary(repo);
  };

  const retry = () => {
    setView({ status: "loading" });
    void (repository ? loadSummary(repository) : loadRepositories());
  };

  const calculate = async (repo: string, pullRequestNumber: number) => {
    setCalculating(pullRequestNumber);
    setNotice(null);

    try {
      const result = await calculatePullRequestDebt(repo, pullRequestNumber);

      setRepositories((prev) =>
        prev.includes(repo) ? prev : [...prev, repo].sort()
      );

      if (repo !== repository) {
        setRepository(repo);
        setView({ status: "loading" });
      }

      await loadSummary(repo);

      const skipped = result.findings_skipped
        ? ` (${result.findings_skipped} lower-severity findings skipped)`
        : "";

      setNotice({
        kind: "success",
        message:
          `PR #${pullRequestNumber}: ${result.review.total_findings} issues, ` +
          `health ${result.review.health_score}/100${skipped}.`,
      });
    } catch (e) {
      setNotice({
        kind: "error",
        message:
          e instanceof TechnicalDebtApiError && e.status === 404
            ? `The analysis engine has no completed analysis for ${repo} PR #${pullRequestNumber} yet.`
            : `Calculation failed: ${messageOf(e)}`,
      });
    } finally {
      setCalculating(null);
    }
  };

  return (
    <>
      <DebtHeader />

      <DebtControls
        repositories={repositories}
        repository={repository}
        calculating={calculating !== null}
        mayCalculate={mayCalculate}
        onRepositoryChange={changeRepository}
        onCalculate={calculate}
      />

      {calculating !== null && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-[#4338CA]">
          <Loader2 size={18} className="shrink-0 animate-spin" />
          Running the classification and estimation agents on PR #{calculating}.
          This makes two AI calls per finding and can take a few minutes.
        </div>
      )}

      {notice && (
        <div
          className={`mt-6 flex items-center gap-3 rounded-xl border p-4 text-sm ${
            notice.kind === "success"
              ? "border-green-100 bg-green-50 text-green-700"
              : "border-red-100 bg-red-50 text-red-700"
          }`}
        >
          {notice.kind === "success" ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          {notice.message}
        </div>
      )}

      <div className="mt-6">

        {view.status === "loading" && (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-16 text-sm text-gray-500 shadow-sm">
            <Loader2 size={18} className="animate-spin" />
            Loading technical debt…
          </div>
        )}

        {view.status === "empty" && (
          <div className="flex flex-col items-center rounded-2xl bg-white p-16 text-center shadow-sm">
            <Inbox size={40} className="text-gray-300" />
            <h2 className="mt-4 text-lg font-bold text-gray-800">
              No technical debt reviews {repository ? `for ${repository}` : ""} yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Enter the repository and the number of a Pull Request the analysis engine has
              analysed, then select <span className="font-semibold">Calculate Debt</span>.
            </p>
          </div>
        )}

        {view.status === "error" && (
          <div className="flex flex-col items-center rounded-2xl bg-white p-16 text-center shadow-sm">
            <AlertCircle size={40} className="text-red-400" />
            <h2 className="mt-4 text-lg font-bold text-gray-800">
              Could not load technical debt
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              {view.message}. Check that the technical-debt service is running on port 5003.
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-5 flex items-center gap-2 rounded-lg bg-[#4338CA] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {view.status === "ready" && (
          <>
            <DebtSummaryCards summary={view.summary} />

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <DebtTrendChart trend={view.summary.trend} />
              <DebtBreakdown summary={view.summary} />
            </div>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  Highest-Priority Issues
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Riskiest first, then by estimated effort
                </p>
              </div>

              <DebtIssueList issues={view.summary.top_issues} />

            </div>

            <div className="mt-6">
              <PullRequestDebtTable
                repository={repository}
                pullRequests={view.summary.pull_requests}
                calculating={calculating !== null}
                mayRecalculate={mayCalculate}
                onRecalculate={(pr) => calculate(repository, pr)}
              />
            </div>
          </>
        )}

      </div>
    </>
  );
}
