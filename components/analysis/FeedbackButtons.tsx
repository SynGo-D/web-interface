"use client";

import { useState, useSyncExternalStore } from "react";
import type { AgentFinding, FeedbackVerdict } from "@/lib/api";
import { allows } from "@/lib/capabilities";
import { getWorkspace, noWorkspace, subscribeToWorkspace } from "@/lib/workspace";

const OPTIONS: { verdict: FeedbackVerdict; label: string }[] = [
  { verdict: "useful", label: "👍 Useful" },
  { verdict: "not_useful", label: "👎 Not useful" },
  { verdict: "wrong", label: "✗ Wrong" },
];

type Counts = NonNullable<AgentFinding["feedback"]>;
const EMPTY: Counts = { useful: 0, not_useful: 0, wrong: 0, mine: null };

/**
 * Rates one AI issue. "Wrong" matters most: an issue marked wrong isn't
 * reported again on later reviews of this repository, and the share of
 * issues marked wrong is the review's real false-alarm rate.
 */
export default function FeedbackButtons({
  feedback,
  onFeedback,
}: {
  feedback: AgentFinding["feedback"];
  onFeedback: (verdict: FeedbackVerdict) => Promise<void>;
}) {
  const [counts, setCounts] = useState<Counts>(feedback ?? EMPTY);
  const [error, setError] = useState(false);

  // Rating is one of the capabilities a manager does not hold: a "wrong"
  // suppresses the finding on later reviews, so it is a change to what
  // the repository reports, not an opinion.
  const workspace = useSyncExternalStore(subscribeToWorkspace, getWorkspace, noWorkspace);
  const mayRate = allows(workspace?.role, "rules");

  async function choose(verdict: FeedbackVerdict) {
    if (verdict === counts.mine) return;
    const previous = counts;
    // Update right away; undo if the server refuses.
    setCounts({
      ...counts,
      ...(counts.mine ? { [counts.mine]: counts[counts.mine] - 1 } : {}),
      [verdict]: counts[verdict] + 1,
      mine: verdict,
    });
    setError(false);
    try {
      await onFeedback(verdict);
    } catch {
      setCounts(previous);
      setError(true);
    }
  }

  if (!mayRate) {
    const total = counts.useful + counts.not_useful + counts.wrong;
    return total === 0 ? null : (
      <p className="mt-3 text-xs text-gray-500">
        Rated {counts.useful} useful, {counts.not_useful} not useful, {counts.wrong} wrong.
      </p>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" role="group" aria-label="Rate this issue">
      {OPTIONS.map(({ verdict, label }) => (
        <button
          key={verdict}
          type="button"
          aria-pressed={counts.mine === verdict}
          onClick={() => choose(verdict)}
          className={`rounded-lg border px-2 py-1 ${
            counts.mine === verdict
              ? "border-[#4338CA] bg-[#4338CA] font-semibold text-white"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {label}
          {counts[verdict] > 0 ? ` ${counts[verdict]}` : ""}
        </button>
      ))}
      {error && <span className="text-red-600">Couldn&apos;t save your rating.</span>}
    </div>
  );
}
