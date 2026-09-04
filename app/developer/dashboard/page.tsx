"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import FindingsList from "@/components/dashboard/FindingsList";
import OverviewCards from "@/components/analysis/OverviewCards";
import { getUser } from "@/lib/session";
import {
  listIntegrations,
  getRepositoryAnalysis,
  type Integration,
  type AnalysisResult,
} from "@/lib/api";

interface RepositoryFindings {
  integration: Integration;
  results: AnalysisResult[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [repositories, setRepositories] = useState<RepositoryFindings[]>([]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    listIntegrations()
      .then(async (integrations) => {
        const active = integrations.filter((i) => i.status === "ACTIVE");

        const withFindings = await Promise.all(
          active.map(async (integration) => {
            const results = await getRepositoryAnalysis(
              integration.repositoryOwner,
              integration.repositoryName
            ).catch(() => []);
            return { integration, results };
          })
        );

        setRepositories(withFindings);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const totalFindings = repositories.reduce(
    (sum, repo) => sum + repo.results.reduce((s, r) => s + r.findings.length, 0),
    0
  );

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-500">
            Code review findings across all your connected repositories.
          </p>

          {loading ? (
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
              Loading...
            </div>
          ) : repositories.length === 0 ? (
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
              No connected repositories yet. Connect one from the Repositories
              page to start seeing findings here.
            </div>
          ) : (
            <>
              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex gap-8">
                  <div>
                    <p className="text-sm text-gray-500">Connected repositories</p>
                    <p className="text-2xl font-bold text-gray-900">{repositories.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Open findings</p>
                    <p className="text-2xl font-bold text-gray-900">{totalFindings}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {repositories.map(({ integration, results }) => {
                  const latest = results[0];

                  return (
                    <div
                      key={integration.id}
                      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {integration.repositoryOwner}/{integration.repositoryName}
                        </h2>
                        {latest && (
                          <Link
                            href={`/developer/analysis/${integration.repositoryOwner}/${integration.repositoryName}/${latest.pull_request_number}`}
                            className="text-sm font-medium text-[#4338CA] hover:underline"
                          >
                            View full analysis →
                          </Link>
                        )}
                      </div>

                      {latest && latest.status === "completed" && (
                        <div className="mt-4">
                          <OverviewCards metrics={latest.metrics} />
                        </div>
                      )}

                      <hr className="my-4 border-gray-100" />
                      <FindingsList results={results} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}