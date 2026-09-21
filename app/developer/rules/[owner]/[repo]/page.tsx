"use client";

import { useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import RulesManager from "@/components/rules/RulesManager";
import ReviewUsagePanel from "@/components/rules/ReviewUsagePanel";
import { EmptyBanner } from "@/components/analysis/AnalysisStateBanner";
import { getUser } from "@/lib/session";

export default function RulesPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  // The session lives in browser storage: unknown (null) during server
  // rendering, read directly on the client.
  const signedIn = useSyncExternalStore(
    () => () => {},
    () => Boolean(getUser()),
    () => null
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        <div className="mx-auto max-w-5xl">
          <Link href="/developer/dashboard" className="text-sm font-medium text-[#4338CA] hover:underline">
            ← Back to dashboard
          </Link>
          <div className="mt-4">
            {signedIn === false && <EmptyBanner message="Sign in to manage this repository's rules." />}
            {signedIn && (
              <div className="space-y-6">
                <ReviewUsagePanel owner={owner} repo={repo} />
                <RulesManager owner={owner} repo={repo} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
