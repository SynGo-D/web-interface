"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import RepositoryForm from "@/components/forms/RepositoryForm";
import { can, listIntegrations, type Integration } from "@/lib/api";
import { isSignedIn, signedInUnknown, subscribeToSession } from "@/lib/session";
import { getWorkspace, noWorkspace, subscribeToWorkspace } from "@/lib/workspace";

/**
 * The first thing a project needs. Opening a project with no repository
 * lands here instead of on an empty dashboard: nothing can be reviewed,
 * charted or ruled on until there is code to look at.
 */
export default function ConnectRepositoryPage() {
  const signedIn = useSyncExternalStore(subscribeToSession, isSignedIn, signedInUnknown);
  const workspace = useSyncExternalStore(subscribeToWorkspace, getWorkspace, noWorkspace);

  const [integrations, setIntegrations] = useState<Integration[] | null>(null);

  // Someone may have reached this page with a repository already
  // connected — by bookmark, or because a teammate connected one
  // meanwhile — so say so rather than making them connect a second.
  useEffect(() => {
    if (!signedIn || !workspace) return;
    let current = true;

    listIntegrations(workspace.organizationId, workspace.projectId)
      .then((all) => current && setIntegrations(all))
      .catch(() => current && setIntegrations([]));

    return () => {
      current = false;
    };
  }, [signedIn, workspace]);

  if (signedIn === false) {
    return (
      <Shell title="Connect a repository">
        <p className="text-gray-700">Sign in to connect a repository.</p>
      </Shell>
    );
  }

  if (workspace === null) {
    return (
      <Shell title="Connect a repository">
        <p className="text-gray-700">
          Choose a project first, then connect its repository.{" "}
          <Link href="/select-project" className="font-medium text-[#4338CA] hover:underline">
            Choose a project
          </Link>
        </p>
      </Shell>
    );
  }

  const active = (integrations ?? []).filter((integration) => integration.status === "ACTIVE");
  const pending = (integrations ?? []).filter((integration) => integration.status === "PENDING");

  return (
    <Shell title="Connect a repository" subtitle={`${workspace.projectName} · ${workspace.organizationName}`}>
      <p className="text-gray-600">
        <strong className="font-semibold text-gray-900">{workspace.projectName}</strong> has no repository yet.
        Connect one to start automated code reviews, technical-debt tracking and business-rule checks for this
        project.
      </p>

      {active.length > 0 && (
        <div className="mt-5 rounded-lg bg-green-50 p-4 text-sm text-green-800">
          {active.map((integration) => (
            <p key={integration.id}>
              {integration.repositoryOwner}/{integration.repositoryName} is already connected.
            </p>
          ))}
          <Link href="/developer/dashboard" className="mt-2 inline-block font-semibold underline">
            Go to the dashboard →
          </Link>
        </div>
      )}

      {pending.length > 0 && (
        <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          {pending.map((integration) => (
            <p key={integration.id}>
              {integration.repositoryOwner}/{integration.repositoryName} was added but never authorized. Connect it
              again to finish.
            </p>
          ))}
        </div>
      )}

      {can(workspace.role, "MANAGER") ? (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <RepositoryForm />
          <p className="mt-3 text-xs text-gray-500">
            You&apos;ll review the repository&apos;s details and then authorize access on GitHub. Private
            repositories work too.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          Repositories are connected by managers and admins. Ask one of them to connect the first repository for
          this project.
        </div>
      )}

      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/select-project" className="font-medium text-gray-600 hover:underline">
          ← Back to projects
        </Link>
        <Link href="/developer/dashboard" className="font-medium text-gray-600 hover:underline">
          Skip for now
        </Link>
      </div>
    </Shell>
  );
}

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#4338CA] p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-indigo-100">{subtitle}</p>}

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">{children}</div>
      </div>
    </main>
  );
}
