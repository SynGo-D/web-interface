"use client";
import { Suspense, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import PullRequestBrowser from "@/components/analysis/PullRequestBrowser";
import { isSignedIn, signedInUnknown, subscribeToSession } from "@/lib/session";
import { getWorkspace, noWorkspace, subscribeToWorkspace } from "@/lib/workspace";
import { WITHHELD, allows } from "@/lib/capabilities";

function FixingContent() {
  const params = useSearchParams();
  const signedIn = useSyncExternalStore(subscribeToSession, isSignedIn, signedInUnknown);
  const workspace = useSyncExternalStore(subscribeToWorkspace, getWorkspace, noWorkspace);
  const number = Number(params.get("pr"));
  // Requesting a fix writes a branch and a pull request, which the roles
  // table gives to developers and administrators. ai-suggestions refuses
  // a manager anyway; this is so they are not sent to it to find out.
  const mayFix = allows(workspace?.role, "debtAndFixes");
  return <div className="flex h-screen"><Sidebar /><main className="flex-1 overflow-y-auto bg-gray-50 p-8 text-gray-900">
    <div className="mx-auto max-w-5xl"><h1 className="text-3xl font-bold">AI Code Fixing</h1>
      <p className="mb-6 mt-1 text-gray-600">Select findings, review their fixes, and create a validated pull request.</p>
      {signedIn === false && <p>Sign in to use AI Code Fixing.</p>}
      {signedIn && !workspace && <p>Choose a project from the sidebar to get started.</p>}
      {signedIn && workspace && !mayFix && <p className="text-gray-600">{WITHHELD.debtAndFixes}</p>}
      {signedIn && workspace && mayFix && <PullRequestBrowser organizationId={workspace.organizationId} projectId={workspace.projectId} fixing
        initialRepository={params.get("repository") ?? ""} initialNumber={Number.isSafeInteger(number) && number > 0 ? number : null} />}
    </div></main></div>;
}
export default function AiFixingPage() { return <Suspense fallback={<p>Loading AI Code Fixing…</p>}><FixingContent /></Suspense>; }
