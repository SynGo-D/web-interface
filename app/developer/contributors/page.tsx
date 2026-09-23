"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { EmptyBanner, ErrorBanner, LoadingBanner } from "@/components/analysis/AnalysisStateBanner";
import ContributorCard from "@/components/contributors/ContributorCard";
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

  // The selected integration, not just its name: the card builds each
  // avatar URL from the provider plus the account id.
  const selected = integrations?.find((i) => repositoryOf(i) === repository) ?? null;
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
                <>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {contributors.map((contributor) => (
                      <ContributorCard
                        key={contributor.username}
                        contributor={contributor}
                        provider={selected?.provider ?? "github"}
                      />
                    ))}
                  </div>

                  <p className="mt-4 text-xs text-gray-500">
                    Measured from pull requests this platform reviewed, not from the provider&apos;s commit
                    history — someone who hasn&apos;t opened a pull request since the repository was connected
                    won&apos;t appear.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
