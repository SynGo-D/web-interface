"use client";

import { useSyncExternalStore } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import PullRequestBrowser from "@/components/analysis/PullRequestBrowser";
import { EmptyBanner } from "@/components/analysis/AnalysisStateBanner";
import { isSignedIn, signedInUnknown, subscribeToSession } from "@/lib/session";
import { getWorkspace, noWorkspace, subscribeToWorkspace } from "@/lib/workspace";

export default function PullRequestsPage() {
  // The session lives in browser storage: unknown (null) while rendering
  // on the server, read directly on the client.
  const signedIn = useSyncExternalStore(subscribeToSession, isSignedIn, signedInUnknown);

  const workspace = useSyncExternalStore(subscribeToWorkspace, getWorkspace, noWorkspace);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900">Pull Requests</h1>
          <p className="mt-1 text-gray-600">
            {workspace ? `${workspace.projectName}: pick a repository and a pull request to read its code review.`
                       : "Choose a project to see its pull requests."}
          </p>

          <div className="mt-6">
            {signedIn === false && <EmptyBanner message="Sign in to view your pull requests." />}
            {signedIn && workspace && (
              <PullRequestBrowser organizationId={workspace.organizationId} projectId={workspace.projectId} />
            )}
            {signedIn && !workspace && (
              <EmptyBanner message="No project chosen yet. Pick one from 'Switch project' in the sidebar." />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
