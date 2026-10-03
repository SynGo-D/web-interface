"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import { EmptyBanner, ErrorBanner, LoadingBanner } from "@/components/analysis/AnalysisStateBanner";
import OverviewCards from "@/components/analysis/OverviewCards";
import QualityProfileChart from "@/components/analysis/QualityProfileChart";
import FindingsList from "@/components/dashboard/FindingsList";
import ContributorCard from "@/components/contributors/ContributorCard";
import DebtSummaryCards from "@/components/developer/debt/DebtSummaryCards";
import DebtTrendChart from "@/components/developer/debt/DebtTrendChart";
import DebtBreakdown from "@/components/developer/debt/DebtBreakdown";
import {
  ApiError,
  getContributors,
  getRepositoryAnalysis,
  listIntegrations,
  type AnalysisResult,
  type Contributor,
  type Integration,
} from "@/lib/api";
import {
  TechnicalDebtApiError,
  getDebtSummary,
  type DebtSummary,
} from "@/lib/technicalDebtApi";
import { isSignedIn, signedInUnknown, subscribeToSession } from "@/lib/session";
import { getWorkspace, noWorkspace, subscribeToWorkspace } from "@/lib/workspace";

function repositoryOf(integration: Integration): string {
  return `${integration.repositoryOwner}/${integration.repositoryName}`;
}

/*
Debt is fetched separately from everything else, and "not calculated yet"
is a state of its own rather than an error. A repository nobody has costed
answers 404, which is not a failure — it is the normal condition of a
repository whose debt nobody has asked for.
*/
type DebtState =
  | { status: "loading" }
  | { status: "absent" }
  | { status: "failed" }
  | { status: "ready"; summary: DebtSummary };

/**
 * How one repository is doing: what the linters found, what the debt costs,
 * and who has been working in it.
 *
 * Scoped to a single repository rather than looping over the project's
 * repositories, as an earlier version did. Debt, its trend and contributors
 * are all repository-scoped — no service offers a cross-repository
 * aggregate — so a multi-repository view could only ever show the quality
 * half. The selector matches Contributors and Debt Calculation, so the
 * whole sidebar behaves the same way.
 *
 * The quality half and the debt half fail independently. Debt arrives from
 * a different service, usually later, and often not at all; a dashboard
 * that went blank because that service was down would be worse than one
 * that shows what it has.
 */
export default function DashboardPage() {
  const signedIn = useSyncExternalStore(subscribeToSession, isSignedIn, signedInUnknown);
  const workspace = useSyncExternalStore(subscribeToWorkspace, getWorkspace, noWorkspace);

  const [integrations, setIntegrations] = useState<Integration[] | null>(null);
  const [repository, setRepository] = useState("");
  const [analyses, setAnalyses] = useState<AnalysisResult[] | null>(null);
  const [contributors, setContributors] = useState<Contributor[] | null>(null);
  const [debt, setDebt] = useState<DebtState>({ status: "loading" });
  const [error, setError] = useState<string | null>(null);

  // The card builds each avatar URL from the provider plus the account id.
  const selected = integrations?.find((i) => repositoryOf(i) === repository) ?? null;

  const fail = useCallback(
    (err: unknown, fallback: string) => setError(err instanceof ApiError ? err.message : fallback),
    []
  );

  useEffect(() => {
    if (!signedIn || !workspace) return;
    let current = true;

    listIntegrations(workspace.organizationId, workspace.projectId)
      .then((all) => {
        if (!current) return;
        const connected = all.filter((i) => i.status === "ACTIVE");
        setIntegrations(connected);
        setRepository((previous) => previous || (connected[0] ? repositoryOf(connected[0]) : ""));
      })
      .catch((err) => current && fail(err, "Couldn't load this project's repositories."));

    return () => {
      current = false;
    };
  }, [signedIn, workspace, fail]);

  useEffect(() => {
    if (!repository) return;
    const [owner, repo] = repository.split("/");
    let current = true;

    // Three requests, not one after another: none of them needs anything
    // from the others, and the page shows each as it lands.
    getRepositoryAnalysis(owner, repo)
      .then((results) => current && (setAnalyses(results), setError(null)))
      .catch((err) => current && fail(err, "Couldn't load this repository's analyses."));

    getContributors(owner, repo)
      .then((data) => current && setContributors(data.contributors))
      // Deliberately quiet: a missing contributor list should not replace
      // the metrics with an error banner.
      .catch(() => current && setContributors([]));

    getDebtSummary(repository)
      .then((summary) => current && setDebt({ status: "ready", summary }))
      .catch((err) =>
        current &&
        setDebt(
          err instanceof TechnicalDebtApiError && err.status === 404
            ? { status: "absent" }
            : { status: "failed" }
        )
      );

    return () => {
      current = false;
    };
  }, [repository, fail]);

  const latestCompleted = analyses?.find((result) => result.status === "completed") ?? null;

  // Busiest first, and only the three that fit a row.
  const topContributors = (contributors ?? [])
    .slice()
    .sort((a, b) => (b.debt.score ?? 0) - (a.debt.score ?? 0) || b.pull_requests - a.pull_requests)
    .slice(0, 3);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-500">
            Code quality, technical debt and contributors for one repository.
          </p>

          {signedIn === false ? (
            <div className="mt-8"><EmptyBanner message="Sign in to see your dashboard." /></div>
          ) : workspace === null ? (
            <div className="mt-8">
              <EmptyBanner message="Choose a project to see its dashboard." />
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <label className="text-sm">
                  <span className="block font-medium text-gray-700">Repository</span>
                  <select
                    value={repository}
                    onChange={(event) => {
                      setRepository(event.target.value);
                      setAnalyses(null);
                      setContributors(null);
                      setDebt({ status: "loading" });
                    }}
                    className="mt-1 min-w-[260px] rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA]"
                  >
                    {integrations === null && <option value="">Loading…</option>}
                    {integrations?.length === 0 && <option value="">No repositories yet</option>}
                    {integrations?.map((integration) => (
                      <option key={integration.id} value={repositoryOf(integration)}>
                        {repositoryOf(integration)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {error && <div className="mt-6"><ErrorBanner message={error} /></div>}

              {!error && integrations !== null && integrations.length === 0 && (
                <div className="mt-6">
                  <EmptyBanner message="No repositories in this project yet. Connect one to start seeing its dashboard." />
                </div>
              )}

              {!error && repository && analyses === null && (
                <div className="mt-6"><LoadingBanner message="Loading..." /></div>
              )}

              {!error && analyses?.length === 0 && (
                <div className="mt-6">
                  <EmptyBanner
                    message={`No analysed pull requests in ${repository} yet. Open one to start seeing its dashboard.`}
                  />
                </div>
              )}

              {!error && analyses && analyses.length > 0 && (
                <div className="mt-6 space-y-6">

                  {latestCompleted && (
                    <Section
                      title="Code quality"
                      subtitle={`Latest completed analysis, pull request #${latestCompleted.pull_request_number}`}
                      action={
                        <Link
                          href={`/developer/analysis/${repository}/${latestCompleted.pull_request_number}`}
                          className="text-sm font-medium text-[#4338CA] hover:underline"
                        >
                          View full analysis →
                        </Link>
                      }
                    >
                      <OverviewCards metrics={latestCompleted.metrics} />
                    </Section>
                  )}

                  <QualityProfileChart results={analyses} />

                  <Debt state={debt} repository={repository} />

                  {topContributors.length > 0 && (
                    <Section
                      title="Top contributors"
                      subtitle="By debt introduced, then by pull requests opened"
                      action={
                        <Link
                          href="/developer/contributors"
                          className="text-sm font-medium text-[#4338CA] hover:underline"
                        >
                          All contributors →
                        </Link>
                      }
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {topContributors.map((contributor) => (
                          <ContributorCard
                            key={contributor.username}
                            contributor={contributor}
                            provider={selected?.provider ?? "github"}
                          />
                        ))}
                      </div>
                    </Section>
                  )}

                  <Section title="Recent findings" subtitle="Across this repository's latest analyses">
                    <FindingsList results={analyses} />
                  </Section>

                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/*
One frame for every panel, so a section that is absent leaves no ragged
gap and every heading sits at the same weight.
*/
function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/*
The debt half.

"Not calculated yet" is shown as an invitation, never as zeros. A health
score of 0 is a real and alarming value, and a repository nobody has costed
must not be made to look like one.
*/
function Debt({ state, repository }: { state: DebtState; repository: string }) {
  if (state.status === "loading") {
    return (
      <Section title="Technical debt">
        <LoadingBanner message="Loading technical debt..." />
      </Section>
    );
  }

  if (state.status === "failed") {
    return (
      <Section title="Technical debt">
        <EmptyBanner message="The technical debt service isn't reachable right now. The rest of this page is unaffected." />
      </Section>
    );
  }

  if (state.status === "absent") {
    return (
      <Section title="Technical debt">
        <p className="text-sm text-gray-500">
          No debt has been calculated for {repository} yet.{" "}
          <Link href="/developer/debt" className="font-medium text-[#4338CA] hover:underline">
            Calculate it
          </Link>{" "}
          to see remediation effort, cost and risk here.
        </p>
      </Section>
    );
  }

  return (
    <>
      <Section
        title="Technical debt"
        subtitle="Remediation effort, cost and risk across analysed pull requests"
        action={
          <Link href="/developer/debt" className="text-sm font-medium text-[#4338CA] hover:underline">
            Debt dashboard →
          </Link>
        }
      >
        <DebtSummaryCards summary={state.summary} />
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Health &amp; debt trend">
          <DebtTrendChart trend={state.summary.trend} />
        </Section>
        <Section title="Debt breakdown">
          <DebtBreakdown summary={state.summary} />
        </Section>
      </div>
    </>
  );
}
