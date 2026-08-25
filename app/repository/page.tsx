"use client";

import { useEffect, useState } from "react";
import RepositoryForm from "@/components/forms/RepositoryForm";
import { listIntegrations, type Integration } from "@/lib/api";
import { getUser } from "@/lib/session";

export default function RepositoryPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      setLoadingIntegrations(false);
      return;
    }

    listIntegrations()
      .then(setIntegrations)
      .catch((error) => console.error(error))
      .finally(() => setLoadingIntegrations(false));
  }, []);

  const connectedIntegrations = integrations.filter(
    (integration) => integration.status !== "REVOKED"
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#4338CA]">
      <div className="mx-auto max-w-5xl ">

        {/* Header */}
        <div className="mb-8 ">
          <h1 className="text-3xl font-bold text-gray-200">
            Repository Dashboard
          </h1>

          <p className="mt-2 text-gray-400">
            Connect and manage your software repositories for automated code
            analysis.
          </p>
        </div>


        {/* Add Repository */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Repository
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Connect your GitHub repository to start automated code reviews and
            technical debt analysis.
          </p>

          <RepositoryForm />
        </div>


        {/* Connected Repositories */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Connected Repositories
          </h2>

          {loadingIntegrations ? (
            <div className="mt-4 rounded-lg bg-gray-50 p-5 text-center text-gray-500">
              Loading...
            </div>
          ) : connectedIntegrations.length === 0 ? (
            <div className="mt-4 rounded-lg bg-gray-50 p-5 text-center text-gray-500">
              No repositories connected yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {connectedIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="rounded-lg bg-gray-50 p-5 text-gray-700"
                >
                  {integration.repositoryOwner}/{integration.repositoryName}
                  {" — "}
                  <span className="text-sm text-gray-500">{integration.status}</span>
                  {integration.status === "ACTIVE" && (
                    <span
                      className={`ml-2 text-sm ${
                        integration.webhookRegistered ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {integration.webhookRegistered
                        ? "• Webhook active"
                        : "• Webhook not registered"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
