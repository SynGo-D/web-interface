"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ApiError,
  can,
  connectedRepositories,
  createOrganization,
  listOrganizations,
  listProjects,
  type OrganizationMembership,
  type Project,
} from "@/lib/api";
import { isSignedIn, signedInUnknown, subscribeToSession } from "@/lib/session";
import { saveWorkspace } from "@/lib/workspace";

const roleLabels: Record<string, string> = { ADMIN: "Admin", MANAGER: "Manager", DEVELOPER: "Developer" };

/**
 * Where everyone lands after signing in: pick the organization and project
 * to work in. Everything after this page — dashboards, pull requests,
 * business rules — is scoped to that choice.
 *
 * Opening a project that has no repository yet leads to the connect page
 * rather than an empty dashboard: there is nothing to review until a
 * repository is connected, so that is the only useful next step.
 */
export default function SelectProjectPage() {
  const router = useRouter();
  const signedIn = useSyncExternalStore(subscribeToSession, isSignedIn, signedInUnknown);

  const [memberships, setMemberships] = useState<OrganizationMembership[] | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newOrgName, setNewOrgName] = useState("");
  const [busy, setBusy] = useState(false);

  const fail = useCallback(
    (err: unknown, fallback: string) => setError(err instanceof ApiError ? err.message : fallback),
    []
  );

  const showOrganizations = useCallback((all: OrganizationMembership[]) => {
    setMemberships(all);
    setSelectedOrg((previous) => previous || all[0]?.organization.id || "");
    setError(null);
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    let current = true;
    listOrganizations()
      .then((all) => current && showOrganizations(all))
      .catch((err) => current && fail(err, "Couldn't load your organizations."));
    return () => {
      current = false;
    };
  }, [signedIn, showOrganizations, fail]);

  useEffect(() => {
    if (!selectedOrg) return;
    let current = true;
    listProjects(selectedOrg)
      .then((all) => {
        if (!current) return;
        setProjects(all);
        setError(null);
      })
      .catch((err) => current && fail(err, "Couldn't load this organization's projects."));
    return () => {
      current = false;
    };
  }, [selectedOrg, fail]);

  const membership = memberships?.find((m) => m.organization.id === selectedOrg) ?? null;

  function open(project: Project) {
    if (!membership) return;

    saveWorkspace({
      organizationId: membership.organization.id,
      organizationName: membership.organization.name,
      role: membership.role,
      projectId: project.id,
      projectName: project.name,
    });

    router.push(
      connectedRepositories(project).length > 0
        ? "/developer/dashboard"
        : "/projects/connect-repository"
    );
  }

  async function addOrganization(name: string) {
    setBusy(true);
    try {
      await createOrganization(name);
      setNewOrgName("");
      showOrganizations(await listOrganizations());
    } catch (err) {
      fail(err, "Couldn't create that organization.");
    } finally {
      setBusy(false);
    }
  }

  if (signedIn === false) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#4338CA] p-8">
        <p className="rounded-xl bg-white px-6 py-4 text-gray-700">Sign in to choose a project.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#4338CA] p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Choose a project</h1>
          <p className="mt-1 text-indigo-100">
            A project groups the repositories of one product. Its dashboards, pull requests and business rules are
            all scoped to it.
          </p>
        </div>

        {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <label className="text-sm">
              <span className="block font-medium text-gray-700">Organization</span>
              <select
                value={selectedOrg}
                onChange={(event) => {
                  setSelectedOrg(event.target.value);
                  setProjects(null);
                }}
                className="mt-1 min-w-[260px] rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA]"
              >
                {memberships === null && <option value="">Loading…</option>}
                {memberships?.length === 0 && <option value="">No organizations yet</option>}
                {memberships?.map((m) => (
                  <option key={m.organization.id} value={m.organization.id}>
                    {m.organization.name} · {roleLabels[m.role] ?? m.role}
                  </option>
                ))}
              </select>
            </label>

            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (newOrgName.trim()) addOrganization(newOrgName.trim());
              }}
            >
              <label className="text-sm">
                <span className="block font-medium text-gray-700">New organization</span>
                <input
                  value={newOrgName}
                  onChange={(event) => setNewOrgName(event.target.value)}
                  placeholder="Acme Payments"
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA]"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Create
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Projects</h2>

            {can(membership?.role, "MANAGER") && selectedOrg && (
              <Link
                href={`/projects/new?organizationId=${encodeURIComponent(selectedOrg)}`}
                className="rounded-lg bg-[#4338CA] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Create a project
              </Link>
            )}
          </div>

          {projects === null && selectedOrg && <p className="mt-3 text-gray-500">Loading…</p>}
          {projects?.length === 0 && (
            <p className="mt-3 text-gray-500">
              No projects yet.
              {can(membership?.role, "MANAGER")
                ? " Create the first one."
                : " Ask a manager to create one."}
            </p>
          )}

          {projects && projects.length > 0 && (
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => open(project)}
                    className="w-full rounded-xl border border-gray-200 p-4 text-left transition hover:border-[#4338CA] hover:shadow-sm"
                  >
                    <p className="font-semibold text-gray-900">{project.name}</p>
                    {project.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{project.description}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">{repositorySummary(project)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

/** "2 repositories · acme/web, acme/api", or what a project still needs. */
function repositorySummary(project: Project): string {
  const connected = connectedRepositories(project);
  const pending = project.repositories.length - connected.length;

  if (connected.length === 0) {
    return pending > 0 ? "Waiting for repository authorization" : "No repository yet — connect one";
  }

  const names = connected
    .slice(0, 2)
    .map((repository) => `${repository.repositoryOwner}/${repository.repositoryName}`)
    .join(", ");

  return (
    `${connected.length} repositor${connected.length === 1 ? "y" : "ies"} · ` +
    `${names}${connected.length > 2 ? "…" : ""}`
  );
}
