"use client";

import type { Contributor } from "@/lib/api";
import Avatar, { avatarUrl } from "./Avatar";

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
 * Remediation time attributed to this person, summed over their pull
 * requests by technical-debt-service.
 *
 * "Pending" is still shown when nothing has been calculated, rather than a
 * zero or a dash: a blank under a heading like "Debt introduced" reads as
 * "none", which is a different claim from "nothing has measured this". The
 * two must not look alike, because one of them is praise.
 */
function Debt({ debt }: { debt: Contributor["debt"] }) {
  const measured = debt.status === "available" && debt.score !== null;

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Debt introduced</span>

      {measured ? (
        <span
          className="text-lg font-semibold text-gray-900"
          title={
            debt.introduced_at
              ? `Estimated remediation time, last calculated ${new Date(debt.introduced_at).toLocaleString()}`
              : "Estimated remediation time"
          }
        >
          {formatRemediation(debt.score!)}
        </span>
      ) : (
        <span
          title="No debt calculation has run for this person's pull requests yet."
          className="cursor-help rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500"
        >
          Pending
        </span>
      )}
    </div>
  );
}

/**
 * Minutes as something a person can weigh against a working day.
 *
 * The debt service counts in minutes, which is right for arithmetic and
 * wrong for reading: "1,950" invites the question "of what?", and the
 * honest answer is about four days. Anything under an hour keeps its
 * minutes rather than rounding to "0.3 h", which reads as nothing at all.
 */
function formatRemediation(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = minutes / 60;
  // One decimal up to a day, then whole hours — "32.5 h" is useful,
  // "187.3 h" is false precision on an estimate this rough.
  return hours < 24 ? `${hours.toFixed(1)} h` : `${Math.round(hours)} h`;
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
