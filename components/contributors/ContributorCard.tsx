"use client";

import Image from "next/image";
import { useState } from "react";
import type { Contributor } from "@/lib/api";

/**
 * A contributor's avatar, derived rather than stored.
 *
 * GitHub serves any account's picture from its numeric id, which is
 * already kept with every analysis — so this costs no API call, needs no
 * extra column, and works for analyses attributed by the backfill just as
 * well as for new ones.
 *
 * GitLab has no equivalent stable URL from an id alone, so it falls back
 * to the initial until an avatar URL is carried through the webhook.
 */
function avatarUrl(provider: string, providerUserId: string | null): string | null {
  if (!providerUserId) return null;

  if (provider === "github") {
    // No query string: next.config.ts pins these hosts with an empty
    // `search`, which is the strict form the Next docs recommend — the
    // permissive one lets anyone have the optimizer fetch URLs that were
    // never intended. next/image sizes the image itself, so the ?s=
    // parameter GitHub accepts is not needed anyway.
    return `https://avatars.githubusercontent.com/u/${encodeURIComponent(providerUserId)}`;
  }
  return null;
}

/**
 * The initial is not a loading state — it is the honest fallback for a
 * deleted account, a blocked image host, or a provider whose avatar URL
 * cannot be derived.
 */
function Avatar({ username, url }: { username: string; url: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        aria-hidden="true"
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#4338CA] text-xl font-semibold text-white"
      >
        {username.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt=""
      width={64}
      height={64}
      // Decorative: the name sits right beside it, so announcing the
      // avatar as well would only repeat it.
      aria-hidden="true"
      onError={() => setFailed(true)}
      className="h-16 w-16 shrink-0 rounded-full bg-gray-100 object-cover"
    />
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-gray-900">{value}</p>
      {detail && <p className="text-[11px] text-gray-500">{detail}</p>}
    </div>
  );
}

/**
 * The debt figure the debt calculation service will provide.
 *
 * Shown as an explicit "not measured yet" rather than a zero or a dash: a
 * blank under a heading like "Debt introduced" reads as "none", which is
 * a different claim from "nothing has measured this".
 */
function Debt({ debt }: { debt: Contributor["debt"] }) {
  const measured = debt.status === "available" && debt.score !== null;

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Debt introduced</span>

      {measured ? (
        <span className="text-lg font-semibold text-gray-900">{debt.score!.toLocaleString()}</span>
      ) : (
        <span
          title="The debt calculation service isn't built yet — this is where each contributor's introduced debt will appear."
          className="cursor-help rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500"
        >
          Pending
        </span>
      )}
    </div>
  );
}

/**
 * The full high/medium/low split rather than just the headline count.
 * "4 findings" invites a shrug; "1 high" is the part somebody acts on,
 * and dropping medium and low to save space would hide work that was
 * genuinely done.
 */
function SeverityBreakdown({ findings }: { findings: Contributor["review_findings"] }) {
  const parts: React.ReactNode[] = [];

  if (findings.high > 0) {
    parts.push(
      <span key="high" className="font-medium text-red-700">
        {findings.high} high
      </span>
    );
  }
  if (findings.medium > 0) parts.push(<span key="medium">{findings.medium} medium</span>);
  if (findings.low > 0) parts.push(<span key="low">{findings.low} low</span>);

  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {index > 0 && ", "}
          {part}
        </span>
      ))}
    </>
  );
}

export default function ContributorCard({
  contributor,
  provider,
}: {
  contributor: Contributor;
  provider: string;
}) {
  const c = contributor;
  const reviewTotal = c.review_findings.high + c.review_findings.medium + c.review_findings.low;

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#4338CA] hover:shadow-md">
      <header className="flex items-center gap-3">
        <Avatar username={c.username} url={avatarUrl(provider, c.provider_user_id)} />

        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-900" title={c.username}>
            {c.username}
          </h3>
          <p className="truncate text-xs text-gray-500">
            {c.analyses} {c.analyses === 1 ? "analysis" : "analyses"}
            {c.last_analysis_at && ` · last ${new Date(c.last_analysis_at).toLocaleDateString()}`}
          </p>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat
          label="Pull requests"
          value={c.pull_requests}
          detail={`${c.files_changed} ${c.files_changed === 1 ? "file" : "files"} changed`}
        />

        <Stat
          label="Lines"
          value={
            <>
              <span className="text-green-700">+{c.lines_added.toLocaleString()}</span>
              <span className="text-gray-400"> / </span>
              <span className="text-red-700">−{c.lines_removed.toLocaleString()}</span>
            </>
          }
        />

        <Stat
          label="Linter issues"
          value={c.issues}
          detail={
            c.issues > 0
              ? `${c.errors} ${c.errors === 1 ? "error" : "errors"}, ${c.warnings} ${
                  c.warnings === 1 ? "warning" : "warnings"
                }`
              : undefined
          }
        />

        <Stat
          label="Review findings"
          value={reviewTotal === 0 ? <span className="text-gray-400">—</span> : reviewTotal}
          detail={reviewTotal > 0 ? <SeverityBreakdown findings={c.review_findings} /> : undefined}
        />
      </div>

      {/* Pushed to the bottom so the debt line sits level across a row of
          cards whose stats wrap to different heights. */}
      <div className="mt-auto">
        <Debt debt={c.debt} />
      </div>
    </article>
  );
}
