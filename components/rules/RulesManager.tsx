"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addRule,
  ApiError,
  deleteRule,
  getRules,
  suggestRules,
  updateRule,
  type BusinessRule,
  type NewBusinessRule,
} from "@/lib/api";

const severityStyles: Record<BusinessRule["severity"], string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

const POLL_MS = 5_000;
const EMPTY_FORM = { rule_id: "", rule: "", applies_to: "", severity: "medium" as BusinessRule["severity"], rationale: "" };

function RuleText({ rule }: { rule: BusinessRule }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-gray-600">{rule.rule_id}</span>
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${severityStyles[rule.severity]}`}>{rule.severity}</span>
      </p>
      <p className="mt-1 text-gray-900">{rule.rule}</p>
      <p className="mt-1 text-xs text-gray-500">
        Applies to: {rule.applies_to.length > 0 ? rule.applies_to.join(", ") : "all files"}
      </p>
      {rule.rationale && <p className="mt-1 text-xs text-gray-500">Why: {rule.rationale}</p>}
      {rule.evidence && (
        <p className="mt-1 break-all font-mono text-xs text-gray-500" title="Where the suggestion came from">
          Source: {rule.evidence}
        </p>
      )}
    </div>
  );
}

/**
 * A repository's business rules: the ones in force, suggestions waiting
 * for a decision, and a form to add rules. Rules in the repository's own
 * .codepulse/rules.yml aren't listed here — they live with the code.
 */
export default function RulesManager({ owner, repo }: { owner: string; repo: string }) {
  const [rules, setRules] = useState<BusinessRule[] | null>(null);
  const [mining, setMining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [branch, setBranch] = useState("main");

  const show = useCallback((body: { rules: BusinessRule[]; mining: boolean }) => {
    setRules(body.rules);
    setMining(body.mining);
    setError(null);
  }, []);

  const showError = useCallback((err: unknown) => {
    setError(err instanceof ApiError ? err.message : "Couldn't load rules.");
  }, []);

  const load = useCallback(
    () => getRules(owner, repo).then(show).catch(showError),
    [owner, repo, show, showError]
  );

  // First load. State is set in the promise callback, and a response that
  // arrives after the repository changed (or the page closed) is ignored.
  useEffect(() => {
    let current = true;
    getRules(owner, repo)
      .then((body) => current && show(body))
      .catch((err) => current && showError(err));
    return () => {
      current = false;
    };
  }, [owner, repo, show, showError]);

  // While suggestions are being generated, re-check every few seconds.
  // Each load replaces `rules`, which re-arms this timer until mining ends.
  useEffect(() => {
    if (!mining) return;
    const timer = setTimeout(load, POLL_MS);
    return () => clearTimeout(timer);
  }, [mining, rules, load]);

  async function run(action: () => Promise<unknown>) {
    try {
      await action();
      setError(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const rule: NewBusinessRule = {
      rule_id: form.rule_id.trim().toUpperCase(),
      rule: form.rule.trim(),
      applies_to: form.applies_to.split(",").map((p) => p.trim()).filter(Boolean),
      severity: form.severity,
      rationale: form.rationale.trim() || null,
    };
    run(async () => {
      await addRule(owner, repo, rule);
      setForm(EMPTY_FORM);
    });
  }

  const active = rules?.filter((r) => r.status === "active") ?? [];
  const suggested = rules?.filter((r) => r.status === "suggested") ?? [];
  const rejected = rules?.filter((r) => r.status === "rejected") ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Business rules · {owner}/{repo}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Every pull request&apos;s AI review checks these rules. Rules can also live in the repository itself, in{" "}
          <span className="font-mono">.codepulse/rules.yml</span>; those are read from the branch a PR targets and
          aren&apos;t listed here.
        </p>
        {error && <p className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Rules in force</h2>
        {rules === null ? (
          <p className="mt-3 text-gray-500">Loading…</p>
        ) : active.length === 0 ? (
          <p className="mt-3 text-gray-500">No rules yet. Add one below, or ask for suggestions.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {active.map((rule) => (
              <li key={rule.rule_id} className="flex flex-wrap items-start gap-3 py-3">
                <RuleText rule={rule} />
                <button
                  type="button"
                  onClick={() => run(() => deleteRule(owner, repo, rule.rule_id))}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Suggested rules</h2>
          <div className="flex items-center gap-2">
            <input
              aria-label="Branch to read"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-sm text-black outline-none focus:border-[#4338CA]"
            />
            <button
              type="button"
              disabled={mining}
              onClick={() => run(async () => { await suggestRules(owner, repo, branch.trim() || "main"); })}
              className="rounded-lg bg-[#4338CA] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {mining ? "Reading the repository…" : "Suggest rules"}
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Suggestions come from the repository&apos;s own docs, tests and code, each with the line it came from. None
          is used until you accept it.
        </p>
        {suggested.length === 0 ? (
          <p className="mt-3 text-gray-500">{mining ? "This usually takes under two minutes." : "No suggestions waiting."}</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100">
            {suggested.map((rule) => (
              <li key={rule.rule_id} className="flex flex-wrap items-start gap-3 py-3">
                <RuleText rule={rule} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => run(() => updateRule(owner, repo, rule.rule_id, { status: "active" }))}
                    className="rounded-lg bg-green-600 px-3 py-1 text-sm font-semibold text-white"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => run(() => updateRule(owner, repo, rule.rule_id, { status: "rejected" }))}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {rejected.length > 0 && (
          <p className="mt-3 text-xs text-gray-400">
            {rejected.length} rejected suggestion{rejected.length === 1 ? "" : "s"} hidden (won&apos;t be suggested again).
          </p>
        )}
      </div>

      <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Add a rule</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            required
            placeholder="ID, e.g. REFUND-APPROVAL"
            value={form.rule_id}
            onChange={(e) => setForm({ ...form, rule_id: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA]"
          />
          <select
            aria-label="Severity"
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value as BusinessRule["severity"] })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA]"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <textarea
            required
            placeholder="The rule, e.g. Refunds above $500 need a manager's approval."
            value={form.rule}
            onChange={(e) => setForm({ ...form, rule: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA] sm:col-span-2"
          />
          <input
            placeholder="Applies to (optional), e.g. payments/**, src/billing/*.py"
            value={form.applies_to}
            onChange={(e) => setForm({ ...form, applies_to: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA] sm:col-span-2"
          />
          <input
            placeholder="Why (optional)"
            value={form.rationale}
            onChange={(e) => setForm({ ...form, rationale: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-[#4338CA] sm:col-span-2"
          />
        </div>
        <button type="submit" className="mt-4 rounded-lg bg-[#4338CA] px-4 py-2 text-sm font-semibold text-white">
          Add rule
        </button>
      </form>
    </div>
  );
}
