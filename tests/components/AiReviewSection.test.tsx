import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AiReviewSection from "@/components/analysis/AiReviewSection";
import type { AgentReview } from "@/lib/api";

const completed: AgentReview = {
  review_id: "r1",
  status: "completed",
  skip_reason: null,
  summary: "Applies the discount before tax.",
  areas_touched: ["billing"],
  risk_level: "medium",
  findings: [
    {
      finding_id: "f1", fingerprint: "fp1", title: "Negative totals possible", category: "correctness",
      severity: "medium", confidence: 0.8, file_path: "billing/total.py", line_start: 2, line_end: 2,
      explanation: "A discount larger than the price gives a negative total.",
      evidence: [{ type: "code_location", ref: "billing/total.py:2", quote: "return (price - discount) * 1.2", verified: true }],
      suggested_fix: "- return (price - discount) * 1.2\n+ return max(price - discount, 0) * 1.2",
      verification: "unverified",
    },
  ],
  linter_triage: [
    { fingerprint: "t1", tool: "eslint", rule_id: "no-dupe-args", file_path: "src/stringUtils.js", line: 477,
      message: "Duplicate param 'a'.", importance: "high", reason: "The module fails to parse." },
  ],
  dropped: [],
  stats: { model: "gpt-5.6-luna", rounds: 1, tool_calls: 0, cost_usd: 0.00073, duration_ms: 8800,
           candidates_proposed: 2, candidates_dropped: 1 },
  error_message: null,
};

describe("AiReviewSection", () => {
  it("shows the summary, risk, issues with checked evidence, and triaged linter findings", () => {
    render(<AiReviewSection review={completed} />);

    expect(screen.getByText("Applies the discount before tax.")).toBeInTheDocument();
    expect(screen.getByText("Risk: medium")).toBeInTheDocument();
    expect(screen.getByText("Negative totals possible")).toBeInTheDocument();
    expect(screen.getByText("✓ billing/total.py:2")).toBeInTheDocument();
    expect(screen.getByText("The module fails to parse.")).toBeInTheDocument();
    expect(screen.getByText(/\$0\.0007/)).toBeInTheDocument();
    expect(screen.getByText(/1 of 2 suggested issues dropped/)).toBeInTheDocument();
  });

  it("says plainly when there is nothing to report", () => {
    render(<AiReviewSection review={{ ...completed, findings: [], risk_level: "low" }} />);

    expect(screen.getByText("No issues found beyond the linter report.")).toBeInTheDocument();
  });

  it("renders model text as text, never as markup", () => {
    const hostile = { ...completed, summary: "<img src=x onerror=alert(1)>" };
    const { container } = render(<AiReviewSection review={hostile} />);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
  });

  it.each([
    [{ status: "running" as const }, "AI review in progress"],
    [{ status: "skipped" as const, skip_reason: "too_large" as const }, "too large for an AI review"],
    [{ status: "failed" as const }, "couldn't be completed"],
  ])("explains a review that isn't complete (%o)", (overrides, text) => {
    render(<AiReviewSection review={{ ...completed, ...overrides }} />);

    expect(screen.getByText(new RegExp(text))).toBeInTheDocument();
  });
});
