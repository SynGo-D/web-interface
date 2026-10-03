import { describe, expect, it } from "vitest";
import { AXES, SATURATION, buildQualityProfile, selectComparison } from "@/lib/qualityProfile";
import type { AnalysisResult, Finding } from "@/lib/api";

function finding(category: string, severity: Finding["severity"], tool = "eslint"): Finding {
  return {
    finding_id: Math.random().toString(36).slice(2),
    file_path: "src/a.js", line: 1, column: 1,
    severity, category, rule_id: "r", message: "m", tool,
  } as Finding;
}

function result(findings: Finding[], loc = 1000, over: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    result_id: "r", job_id: "j", repository: "a/b", pull_request_number: 1,
    commit_sha: "c".repeat(40), branch: "x", status: "completed",
    findings, metrics: { loc, files_analyzed: 1, errors: 0, warnings: 0, total_issues: findings.length,
      error_density: 0, warning_density: 0, issue_density: 0 } as AnalysisResult["metrics"],
    rule_statistics: [], file_statistics: [],
    started_at: "", completed_at: "", error_message: null, ...over,
  } as AnalysisResult;
}

describe("quality profile", () => {
  it("scores a clean analysis at 100 on every axis", () => {
    const p = buildQualityProfile(result([]))!;
    expect(p.axes.map((a) => a.score)).toEqual(AXES.map(() => 100));
    expect(p.overall).toBe(100);
  });

  it("routes each engine category to its own axis", () => {
    const p = buildQualityProfile(result([
      finding("bug", "error"), finding("vulnerability", "error"),
      finding("code_smell", "warning"), finding("maintainability", "warning"),
      finding("complexity", "error"), finding("cognitive_complexity", "error"),
      finding("unused_code", "info"), finding("style", "info"),
    ]))!;
    const by = Object.fromEntries(p.axes.map((a) => [a.axis, a.count]));
    expect(by["Bugs"]).toBe(1);
    expect(by["Security"]).toBe(1);
    expect(by["Maintainability"]).toBe(2);   // code_smell and maintainability share an axis
    expect(by["Cyclomatic complexity"]).toBe(1);
    expect(by["Cognitive complexity"]).toBe(1);
    expect(by["Unused code"]).toBe(1);
    expect(by["Style"]).toBe(1);
  });

  it("weights an error above a note rather than counting them alike", () => {
    const strict = buildQualityProfile(result([finding("bug", "error")]))!;
    const mild = buildQualityProfile(result([finding("bug", "info")]))!;
    const bugOf = (p: typeof strict) => p.axes.find((a) => a.axis === "Bugs")!;
    expect(bugOf(strict).score).toBeLessThan(bugOf(mild).score);
    expect(bugOf(strict).density).toBe(3);   // error weight
    expect(bugOf(mild).density).toBe(1);
  });

  it("measures density per thousand lines, so size alone is not a penalty", () => {
    const small = buildQualityProfile(result([finding("bug", "error")], 1000))!;
    const large = buildQualityProfile(result(
      Array.from({ length: 10 }, () => finding("bug", "error")), 10000))!;
    const bugOf = (p: typeof small) => p.axes.find((a) => a.axis === "Bugs")!;
    expect(bugOf(large).score).toBe(bugOf(small).score);
  });

  it("floors at zero once an axis saturates rather than going negative", () => {
    const many = Array.from({ length: 200 }, () => finding("vulnerability", "error"));
    const sec = buildQualityProfile(result(many))!.axes.find((a) => a.axis === "Security")!;
    expect(sec.score).toBe(0);
    expect(sec.density).toBeGreaterThan(SATURATION["Security"]);
  });

  it("returns nothing for a failed analysis, rather than a perfect score", () => {
    // A failed run has no findings. Scoring it 100 would assert a clean
    // result from a measurement that never completed.
    expect(buildQualityProfile(result([], 1000, { status: "failed" }))).toBeNull();
    expect(buildQualityProfile(result([], 0))).toBeNull();
    expect(buildQualityProfile(null)).toBeNull();
  });

  it("ignores a category it does not recognise instead of guessing an axis", () => {
    const p = buildQualityProfile(result([finding("something_new", "error")]))!;
    expect(p.totalFindings).toBe(0);
    expect(p.axes.every((a) => a.score === 100)).toBe(true);
  });

  it("reports which analysers contributed", () => {
    const p = buildQualityProfile(result([
      finding("bug", "error", "pylint"), finding("style", "info", "eslint"),
      finding("style", "info", "eslint"),
    ]))!;
    expect(p.tools).toEqual(["eslint", "pylint"]);
  });
});

describe("comparison selection", () => {
  const completed = (pr: number) => result([], 1000, { pull_request_number: pr });

  it("compares against a different pull request, not the same one re-analysed", () => {
    // Newest first, with PR 7 analysed twice after a push.
    const { current, previous } = selectComparison([
      completed(7), completed(7), completed(4),
    ]);
    expect(current!.pull_request_number).toBe(7);
    expect(previous!.pull_request_number).toBe(4);
  });

  it("skips failed analyses on both sides", () => {
    const failed = result([], 1000, { pull_request_number: 9, status: "failed" });
    const { current, previous } = selectComparison([failed, completed(7), completed(4)]);
    expect(current!.pull_request_number).toBe(7);
    expect(previous!.pull_request_number).toBe(4);
  });

  it("has no previous when only one pull request has been analysed", () => {
    const { current, previous } = selectComparison([completed(7), completed(7)]);
    expect(current!.pull_request_number).toBe(7);
    expect(previous).toBeNull();
  });
});
