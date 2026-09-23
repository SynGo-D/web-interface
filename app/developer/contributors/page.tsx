"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { EmptyBanner, ErrorBanner, LoadingBanner } from "@/components/analysis/AnalysisStateBanner";
import {
  ApiError,
  getContributors,
  listIntegrations,
  type Contributor,
  type Integration,
} from "@/lib/api";
import { isSignedIn, signedInUnknown, subscribeToSession } from "@/lib/session";
import { getWorkspace, noWorkspace, subscribeToWorkspace } from "@/lib/workspace";

function repositoryOf(integration: Integration): string {
  return `${integration.repositoryOwner}/${integration.repositoryName}`;
}

/**
 * Who has been working in a repository, and what their pull requests
 * amounted to.
 *
 * Everything here is measured from reviews this platform ran, not from
 * the provider's contributor list — so it describes work CodePulse has
 * actually seen, and someone who has not opened a pull request since the
 * repository was connected is legitimately absent.
 */
export default function ContributorsPage() {
  const signedIn = useSyncExternalStore(subscribeToSession, isSignedIn, signedInUnknown);
  const workspace = useSyncExternalStore(subscribeToWorkspace, getWorkspace, noWorkspace);

  const [integrations, setIntegrations] = useState<Integration[] | null>(null);
  const [repository, setRepository] = useState("");
  const [contributors, setContributors] = useState<Contributor[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    getContributors(owner, repo)
      .then((data) => {
        if (!current) return;
        setContributors(data.contributors);
        setError(null);
      })
      .catch((err) => current && fail(err, "Couldn't load this repository's contributors."));

    return () => {
      current = false;
    };
  }, [repository, fail]);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900">Contributors</h1>
          <p className="mt-2 text-gray-500">
            Who has opened pull requests in this repository, and what the reviews found in them.
          </p>

          {signedIn === false ? (
            <div className="mt-8"><EmptyBanner message="Sign in to see contributors." /></div>
          ) : workspace === null ? (
            <div className="mt-8"><EmptyBanner message="Choose a project to see its contributors." /></div>
          ) : (
            <>
              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <label className="text-sm">
                  <span className="block font-medium text-gray-700">Repository</span>
                  <select
                    value={repository}
                    onChange={(event) => {
                      setRepository(event.target.value);
                      setContributors(null);
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
                  <EmptyBanner message="No repositories in this project yet. Connect one to see who is working in it." />
                </div>
              )}
              {!error && repository && contributors === null && (
                <div className="mt-6"><LoadingBanner message="Loading contributors..." /></div>
              )}
              {!error && contributors?.length === 0 && (
                <div className="mt-6">
                  <EmptyBanner
                    message={`No analysed pull requests in ${repository} yet. Contributors appear once their pull requests have been reviewed.`}
                  />
                </div>
              )}

              {contributors && contributors.length > 0 && (
                <ContributorTable contributors={contributors} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function ContributorTable({ contributors }: { contributors: Contributor[] }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-6 py-3 font-medium">Contributor</th>
            <th className="px-6 py-3 text-right font-medium">Pull requests</th>
            <th className="px-6 py-3 text-right font-medium">Lines changed</th>
            <th className="px-6 py-3 text-right font-medium">Linter issues</th>
            <th className="px-6 py-3 text-right font-medium">Review findings</th>
            <th className="px-6 py-3 text-right font-medium">Debt introduced</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {contributors.map((c) => (
            <tr key={c.username} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-semibold text-gray-900">{c.username}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {c.analyses} {c.analyses === 1 ? "analysis" : "analyses"}
                  {c.last_analysis_at && ` · last ${new Date(c.last_analysis_at).toLocaleDateString()}`}
                </p>
              </td>

              <td className="px-6 py-4 text-right font-medium text-gray-900">{c.pull_requests}</td>

              <td className="px-6 py-4 text-right">
                <span className="font-medium text-green-700">+{c.lines_added.toLocaleString()}</span>
                {" / "}
                <span className="font-medium text-red-700">−{c.lines_removed.toLocaleString()}</span>
                <p className="mt-0.5 text-xs text-gray-500">
                  {c.files_changed} {c.files_changed === 1 ? "file" : "files"}
                </p>
              </td>

              <td className="px-6 py-4 text-right">
                <span className="font-medium text-gray-900">{c.issues}</span>
                {c.issues > 0 && (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {c.errors} {c.errors === 1 ? "error" : "errors"}, {c.warnings}{" "}
                    {c.warnings === 1 ? "warning" : "warnings"}
                  </p>
                )}
              </td>

              <td className="px-6 py-4 text-right">
                <ReviewFindings findings={c.review_findings} />
              </td>

              <td className="px-6 py-4 text-right">
                <DebtCell contributor={c} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-xs text-gray-500">
        Measured from pull requests this platform reviewed, not from the provider&apos;s commit history — someone
        who hasn&apos;t opened a pull request since the repository was connected won&apos;t appear.
      </p>
    </div>
  );
}

function ReviewFindings({ findings }: { findings: Contributor["review_findings"] }) {
  const total = findings.high + findings.medium + findings.low;

  if (total === 0) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <>
      <span className="font-medium text-gray-900">{total}</span>
      <p className="mt-0.5 text-xs text-gray-500">
        {findings.high > 0 && <span className="font-medium text-red-700">{findings.high} high</span>}
        {findings.high > 0 && (findings.medium > 0 || findings.low > 0) && ", "}
        {findings.medium > 0 && `${findings.medium} medium`}
        {findings.medium > 0 && findings.low > 0 && ", "}
        {findings.low > 0 && `${findings.low} low`}
      </p>
    </>
  );
}

/**
 * The debt figure the debt calculation service will provide. Shown as an
 * explicit "not measured yet" rather than a zero or a dash: a blank in a
 * column headed "Debt introduced" reads as "none", which is a different
 * claim from "nothing has measured this".
 */
function DebtCell({ contributor }: { contributor: Contributor }) {
  if (contributor.debt.status === "available" && contributor.debt.score !== null) {
    return <span className="font-semibold text-gray-900">{contributor.debt.score.toLocaleString()}</span>;
  }

  return (
    <span
      title="The debt calculation service isn't built yet — this is where each contributor's introduced debt will appear."
      className="cursor-help rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500"
    >
      Pending
    </span>
  );
}
