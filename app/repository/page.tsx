"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import RepositoryForm from "@/components/forms/RepositoryForm";
import { listIntegrations, type Integration } from "@/lib/api";
import { isSignedIn, signedInUnknown, subscribeToSession } from "@/lib/session";
import { getWorkspace, noWorkspace, subscribeToWorkspace } from "@/lib/workspace";

export default function RepositoryPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

  // The session lives in browser storage: unknown (null) while rendering
  // on the server, read directly on the client.
  const signedIn = useSyncExternalStore(subscribeToSession, isSignedIn, signedInUnknown);

  // Repositories belong to a project, so this page shows that project's.
  const workspace = useSyncExternalStore(subscribeToWorkspace, getWorkspace, noWorkspace);

  useEffect(() => {
    if (!signedIn || !workspace) return;

    listIntegrations(workspace.organizationId, workspace.projectId)
      .then(setIntegrations)
      .catch((error) => console.error(error))
      .finally(() => setLoadingIntegrations(false));
  }, [signedIn, workspace]);

  const connectedIntegrations = integrations.filter(
    (integration) => integration.status !== "REVOKED"
  );

  /*
  Back to wherever they came from, which is usually the sidebar page that
  sent them here — this page has no sidebar of its own, so without this
  there is nothing to leave by except the browser chrome.

  router.back() alone is not enough. Opened directly, in a new tab, from a
  bookmark or as the first page after signing in, there is no previous
  entry and the button would do nothing at all while still looking like it
  should. history.length is 1 only in that case, so it is the signal for
  falling back to a destination that always exists.
  */
  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/developer/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#4338CA]">
      <div className="mx-auto max-w-5xl ">

        {/* Header */}
        <div className="mb-8 ">
          <button
            type="button"
            onClick={goBack}
            className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <span aria-hidden="true">&larr;</span>
            Back
          </button>

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

          {signedIn === false ? (
            <p className="text-gray-300">Sign in to see your connected repositories.</p>
          ) : loadingIntegrations ? (
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
                  {" · "}
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
