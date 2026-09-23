"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ApiError,
  can,
  createProject,
  listOrganizations,
  type OrganizationMembership,
} from "@/lib/api";
import { isSignedIn, signedInUnknown, subscribeToSession } from "@/lib/session";
import { saveWorkspace } from "@/lib/workspace";

/**
 * Creating a project, on its own page rather than as a form tucked under
 * the picker: a new project is the start of setting up a product, and it
 * leads straight on to connecting its first repository.
 */
export default function NewProjectPage() {
  return (
    <Suspense fallback={<Shell><p className="text-gray-500">Loading…</p></Shell>}>
      <NewProjectForm />
    </Suspense>
  );
}

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("organizationId") ?? "";
  const signedIn = useSyncExternalStore(subscribeToSession, isSignedIn, signedInUnknown);

  const [membership, setMembership] = useState<OrganizationMembership | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Which organization this project goes into, and whether the user is
  // allowed to add one to it. The server checks the role again; this only
  // decides what the page offers.
  useEffect(() => {
    if (!signedIn || !organizationId) return;
    let current = true;

    listOrganizations()
      .then((all) => {
        if (!current) return;
        setMembership(all.find((m) => m.organization.id === organizationId) ?? null);
      })
      .catch((err) => {
        if (!current) return;
        setMembership(null);
        setError(err instanceof ApiError ? err.message : "Couldn't load that organization.");
      });

    return () => {
      current = false;
    };
  }, [signedIn, organizationId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!membership || !name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const project = await createProject(organizationId, {
        name: name.trim(),
        description: description.trim() || null,
      });

      // Open the new project straight away — a project nobody is working
      // in is not what the user asked for — and send them on to its first
      // repository, since it cannot have one yet.
      saveWorkspace({
        organizationId: membership.organization.id,
        organizationName: membership.organization.name,
        role: membership.role,
        projectId: project.id,
        projectName: project.name,
      });

      router.push("/projects/connect-repository");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create that project.");
      setSubmitting(false);
    }
  }

  if (signedIn === false) {
    return <Shell><p className="text-gray-700">Sign in to create a project.</p></Shell>;
  }

  if (!organizationId) {
    return (
      <Shell>
        <p className="text-gray-700">
          Choose an organization first.{" "}
          <Link href="/select-project" className="font-medium text-[#4338CA] hover:underline">
            Back to projects
          </Link>
        </p>
      </Shell>
    );
  }

  if (membership === null) {
    return (
      <Shell>
        <p className="text-gray-700">{error ?? "You are not a member of this organization."}</p>
        <Link href="/select-project" className="mt-4 inline-block text-sm font-medium text-[#4338CA] hover:underline">
          ← Back to projects
        </Link>
      </Shell>
    );
  }

  if (membership && !can(membership.role, "MANAGER")) {
    return (
      <Shell>
        <p className="text-gray-700">
          Projects are created by managers and admins. Ask one of them to add {membership.organization.name}&apos;s
          next project.
        </p>
        <Link href="/select-project" className="mt-4 inline-block text-sm font-medium text-[#4338CA] hover:underline">
          ← Back to projects
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-sm text-gray-500">
        {membership ? `In ${membership.organization.name}` : "Loading…"}
      </p>

      <form onSubmit={submit} className="mt-5 space-y-5">
        <label className="block">
          <span className="block text-sm font-medium text-gray-700">Project name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Checkout"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-[#4338CA]"
            autoFocus
            required
          />
          <span className="mt-1 block text-xs text-gray-500">
            The product or service whose repositories you want reviewed together.
          </span>
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-gray-700">Description (optional)</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Payment and checkout services."
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-[#4338CA]"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !membership}
            className="rounded-lg bg-[#4338CA] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create project"}
          </button>

          <Link href="/select-project" className="text-sm font-medium text-gray-600 hover:underline">
            Cancel
          </Link>
        </div>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#4338CA] p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-white">Create a new project</h1>
        <p className="mt-1 text-indigo-100">
          Projects keep one product&apos;s repositories, dashboards and business rules together.
        </p>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">{children}</div>
      </div>
    </main>
  );
}
