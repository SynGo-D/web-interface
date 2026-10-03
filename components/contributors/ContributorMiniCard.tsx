"use client";

import type { Contributor } from "@/lib/api";
import Avatar, { avatarUrl } from "./Avatar";

/**
 * Minutes as something a person can weigh against a working day. Mirrors
 * the full card, which rounds the same way for the same reason: "1,950"
 * invites the question "of what?".
 */
function formatRemediation(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  return hours < 24 ? `${hours.toFixed(1)} h` : `${Math.round(hours)} h`;
}

/**
 * A contributor at a glance: who, how much debt, over how many pull
 * requests. The full card carries the rest.
 *
 * "Pending" rather than a zero or a dash when nothing has been
 * calculated, for the same reason the full card does it: a blank under a
 * debt figure reads as "none", and that is praise nobody earned.
 */
export default function ContributorMiniCard({
  contributor,
  provider,
}: {
  contributor: Contributor;
  provider: string;
}) {
  const c = contributor;
  const measured = c.debt.status === "available" && c.debt.score !== null;

  return (
    <article className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-[#4338CA]">
      <Avatar username={c.username} url={avatarUrl(provider, c.provider_user_id)} size={36} />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900" title={c.username}>
          {c.username}
        </p>
        <p className="truncate text-[11px] text-gray-500">
          {measured ? formatRemediation(c.debt.score!) : "Pending"}
          {" · "}
          {c.pull_requests} PR{c.pull_requests === 1 ? "" : "s"}
        </p>
      </div>
    </article>
  );
}
