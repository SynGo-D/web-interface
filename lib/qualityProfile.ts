import type { AnalysisResult, Finding } from "./api";

/*
Turning a pull request's findings into a seven-axis quality profile.

Why a profile rather than a count: "61 issues" says nothing about whether a
change is risky or merely untidy. Sixty style warnings and one injection
vulnerability are the same number and a very different conversation. Splitting
the findings by what they are, and scoring each axis separately, keeps the
security result from being buried under the style result.

Three decisions are worth stating plainly, because each is a judgement rather
than a measurement:

  - Findings are weighted by severity before counting. An error is not one
    third of three info-level notes.
  - Density is per thousand lines analysed, so a large pull request is not
    penalised for being large.
  - Each axis scores 0-100 where HIGHER IS BETTER, against the thresholds in
    SATURATION below. A radar where a bigger shape means worse code reads
    backwards; inverting it means the larger shape is the better one.

The thresholds are configuration, not fact. They are collected in one place
so they can be argued with and changed without touching the arithmetic.
*/

export const AXES = [
  "Bugs",
  "Security",
  "Maintainability",
  "Cyclomatic complexity",
  "Cognitive complexity",
  "Unused code",
  "Style",
] as const;

export type Axis = (typeof AXES)[number];

/* analysis-engine's finding categories, mapped onto the axes above. */
const CATEGORY_TO_AXIS: Record<string, Axis> = {
  bug: "Bugs",
  vulnerability: "Security",
  code_smell: "Maintainability",
  maintainability: "Maintainability",
  complexity: "Cyclomatic complexity",
  cognitive_complexity: "Cognitive complexity",
  unused_code: "Unused code",
  style: "Style",
};

/* An error counts for three notes, a warning for two. */
const SEVERITY_WEIGHT: Record<Finding["severity"], number> = {
  error: 3,
  warning: 2,
  info: 1,
};

/*
Weighted findings per 1,000 lines at which an axis scores zero.

These differ by axis because the axes are not comparable. A single weighted
security finding per thousand lines is serious; the same density of style
findings is ordinary. Set from the distribution observed across the
repositories analysed during development, and deliberately generous on style
so that formatting noise cannot dominate the shape.
*/
export const SATURATION: Record<Axis, number> = {
  "Bugs": 9,
  "Security": 6,
  "Maintainability": 36,
  "Cyclomatic complexity": 12,
  "Cognitive complexity": 12,
  "Unused code": 15,
  "Style": 60,
};

export interface AxisScore {
  axis: Axis;
  /** 0-100, higher is better. */
  score: number;
  /** Raw finding count on this axis, unweighted. */
  count: number;
  /** Severity-weighted findings per 1,000 lines analysed. */
  density: number;
  errors: number;
  warnings: number;
}

export interface QualityProfile {
  pullRequestNumber: number;
  commitSha: string;
  linesAnalysed: number;
  totalFindings: number;
  /** Which analysers produced findings, so a reader knows what was checked. */
  tools: string[];
  axes: AxisScore[];
  /** Mean of the seven axis scores. */
  overall: number;
}

function round(value: number, places = 1): number {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}

/**
 * A profile for one completed analysis, or null when there is nothing to
 * score. A result that failed, or that reports no analysed lines, is not a
 * clean result: it is an absent one, and scoring it 100 would claim a
 * measurement that was never taken.
 */
export function buildQualityProfile(result: AnalysisResult | null | undefined): QualityProfile | null {
  if (!result || result.status !== "completed") return null;

  const lines = result.metrics?.loc ?? 0;
  if (lines <= 0) return null;

  const perThousand = lines / 1000;

  const buckets = new Map<Axis, { count: number; weighted: number; errors: number; warnings: number }>();
  for (const axis of AXES) buckets.set(axis, { count: 0, weighted: 0, errors: 0, warnings: 0 });

  for (const finding of result.findings ?? []) {
    const axis = CATEGORY_TO_AXIS[finding.category];
    // An unrecognised category is skipped rather than forced onto an axis:
    // a new category silently inflating "Maintainability" would be worse
    // than its absence, which at least shows up as findings that do not add up.
    if (!axis) continue;

    const bucket = buckets.get(axis)!;
    bucket.count += 1;
    bucket.weighted += SEVERITY_WEIGHT[finding.severity] ?? 1;
    if (finding.severity === "error") bucket.errors += 1;
    if (finding.severity === "warning") bucket.warnings += 1;
  }

  const axes: AxisScore[] = AXES.map((axis) => {
    const bucket = buckets.get(axis)!;
    const density = bucket.weighted / perThousand;
    const score = Math.max(0, Math.min(100, 100 * (1 - density / SATURATION[axis])));
    return {
      axis,
      score: Math.round(score),
      count: bucket.count,
      density: round(density),
      errors: bucket.errors,
      warnings: bucket.warnings,
    };
  });

  const tools = [...new Set((result.findings ?? []).map((f) => f.tool))].sort();

  return {
    pullRequestNumber: result.pull_request_number,
    commitSha: result.commit_sha,
    linesAnalysed: lines,
    totalFindings: axes.reduce((sum, a) => sum + a.count, 0),
    tools,
    axes,
    overall: Math.round(axes.reduce((sum, a) => sum + a.score, 0) / axes.length),
  };
}

/**
 * The two analyses to compare: the most recent completed one, and the most
 * recent completed analysis of a *different* pull request before it.
 *
 * A different pull request, not simply the previous result, because a pull
 * request re-analysed after a push would otherwise be compared against itself
 * and the comparison would show only what the last commit changed.
 */
export function selectComparison(results: AnalysisResult[]): {
  current: AnalysisResult | null;
  previous: AnalysisResult | null;
} {
  const completed = results.filter((r) => r.status === "completed");
  const current = completed[0] ?? null;
  if (!current) return { current: null, previous: null };

  const previous =
    completed.find((r) => r.pull_request_number !== current.pull_request_number) ?? null;

  return { current, previous };
}
