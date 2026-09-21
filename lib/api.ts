import { getToken } from "./session";

// The only backend web-interface talks to — main-backend proxies
// everything else (integration-service, analysis-engine) internally.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_MAIN_BACKEND_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  // main-backend returns bare JSON (its own house style), not an
  // {success, data} envelope — unwrapping integration-service's own
  // envelope shape is main-backend's job, not this client's.
  if (response.status === 204) {
    return undefined as T; // e.g. a delete: no body to parse
  }
  const body = await response.json();

  if (!response.ok) {
    throw new ApiError(
      body?.message ?? "Request to main-backend failed.",
      response.status
    );
  }

  return body as T;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Integration {
  id: string;
  userId: string;
  provider: "github" | "gitlab";
  repositoryUrl: string;
  repositoryOwner: string;
  repositoryName: string;
  providerUsername?: string;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "REVOKED";
  webhookRegistered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryPreview {
  provider: "github" | "gitlab";
  repositoryUrl: string;
  repository: {
    owner: string;
    name: string;
    description: string | null;
    language: string | null;
    visibility: string;
    stars: number;
    forks: number;
    defaultBranch: string;
    updatedAt: string;
  };
}

export function login(
  email: string,
  fullName: string
): Promise<{ token: string; user: AuthenticatedUser }> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, fullName }),
  });
}

/** Public — no session required, safe to call from server-side code too. */
export function previewRepository(url: string): Promise<RepositoryPreview> {
  return request<RepositoryPreview>(
    `/api/repositories/preview?url=${encodeURIComponent(url)}`
  );
}

/** userId is no longer passed — main-backend derives it from the session token. */
export function authorizeIntegration(
  repositoryUrl: string
): Promise<{ integrationId: string; authorizationUrl: string }> {
  return request("/api/integrations/authorize", {
    method: "POST",
    body: JSON.stringify({ repositoryUrl }),
  });
}

export function listIntegrations(): Promise<Integration[]> {
  return request<Integration[]>("/api/integrations");
}

export function revokeIntegration(id: string): Promise<{ message: string }> {
  return request(`/api/integrations/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------
// Analysis results
// ---------------------------------------------------------------------

export interface Finding {
  finding_id: string;
  file_path: string;
  line: number | null;
  column: number | null;
  severity: "error" | "warning" | "info";
  category: string;
  rule_id: string;
  message: string;
  tool: string;
  /*
  Tool-specific extras. analysis-engine also sets `on_changed_line` here
  (true/false) whenever it could work out what the pull request changed.
  */
  metadata?: Record<string, unknown>;
}

/*
Mirrors analysis-engine's domain/change_set.py: what the pull request
itself changed, relative to the branch it targets.
*/
export interface ChangedFile {
  path: string;
  old_path: string | null;
  status: "added" | "modified" | "deleted" | "renamed";
  is_binary: boolean;
  lines_added: number;
  lines_removed: number;
  added_lines: number[];
  deletion_points: number[];
}

export interface ChangedSymbol {
  symbol_id: string;
  name: string;
  qualified_name: string;
  kind: string;
  file_path: string;
  start_line: number;
  end_line: number;
  callers_count: number;
}

export interface PullRequestChanges {
  status: "available" | "unavailable";
  unavailable_reason: "no_target_branch" | "no_merge_base" | "too_large" | "error" | null;
  change_set: {
    base_sha: string;
    head_sha: string;
    target_branch: string;
    files: ChangedFile[];
    excluded_files: string[];
  } | null;
  changed_symbols: ChangedSymbol[];
  files_changed: number;
  lines_added: number;
  lines_removed: number;
  findings_on_changed_lines: number;
}

/*
Mirrors analysis-engine's domain/agent_review.py: the AI review of a pull
request. Every text field here was written by a model — render it as
plain text only, never as HTML.
*/
export interface ReviewEvidence {
  type: "code_location" | "linter_finding" | "business_rule" | "call_path" | "test";
  ref: string;
  quote: string | null;
  verified: boolean;
}

export interface AgentFinding {
  finding_id: string;
  fingerprint: string;
  title: string;
  category: "correctness" | "security" | "business_rule";
  severity: "high" | "medium" | "low";
  confidence: number;
  rule_ids?: string[]; // absent on reviews stored before business rules existed
  file_path: string;
  line_start: number;
  line_end: number;
  explanation: string;
  evidence: ReviewEvidence[];
  suggested_fix: string | null;
  verification: "unverified" | "verified";
  // Developers' verdicts on this issue, with the signed-in user's own.
  feedback?: { useful: number; not_useful: number; wrong: number; mine: FeedbackVerdict | null } | null;
}

export type FeedbackVerdict = "useful" | "not_useful" | "wrong";

export interface TriagedLinterFinding {
  fingerprint: string;
  tool: string;
  rule_id: string;
  file_path: string;
  line: number | null;
  message: string;
  importance: "high" | "medium" | "low";
  reason: string;
}

export interface RuleCheck {
  rule_id: string;
  rule: string;
  severity: "high" | "medium" | "low";
  outcome: "violated" | "satisfied" | "not_applicable" | "not_confirmed" | "not_checked";
  note: string | null;
}

export interface AgentReview {
  review_id: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  skip_reason: "disabled" | "no_diff" | "too_large" | "no_changes" | null;
  summary: string | null;
  areas_touched: string[];
  risk_level: "low" | "medium" | "high" | null;
  findings: AgentFinding[];
  linter_triage: TriagedLinterFinding[];
  dropped: { title: string; reason: string; stage?: "evidence" | "verifier" }[];
  rule_checks?: RuleCheck[];
  rule_errors?: string[];
  stats: {
    model: string;
    rounds: number;
    tool_calls: number;
    cost_usd: number | null;
    duration_ms: number;
    candidates_proposed: number;
    candidates_dropped: number;
  } | null;
  error_message: string | null;
}

/** True when analysis-engine marked this finding as sitting on a line the PR changed. */
export function isOnChangedLine(finding: Finding): boolean {
  return finding.metadata?.on_changed_line === true;
}

/*
Mirrors analysis-engine's domain/metrics.py field-for-field (same
snake_case names) — every density/average/violation-count figure here is
computed once, by analysis-engine, and only ever displayed here. See
components/analysis/ for where each field is rendered.
*/
export interface ComplexityMetrics {
  violations: number;
  maximum: number | null;
  average: number | null;
}

export interface CognitiveComplexityMetrics {
  violations: number;
  maximum: number | null;
  average: number | null;
}

export interface SizeMetrics {
  largest_file_lines: number;
  largest_function_lines: number | null;
  max_lines_violations: number;
  max_lines_per_function_violations: number;
}

export interface UnusedCodeMetrics {
  unused_variables: number;
  unreachable_code: number;
}

export interface AnalysisMetrics {
  files_analyzed: number;
  loc: number;
  errors: number;
  warnings: number;
  total_issues: number;
  error_density: number;
  warning_density: number;
  issue_density: number;
  complexity: ComplexityMetrics;
  cognitive_complexity: CognitiveComplexityMetrics;
  size: SizeMetrics;
  unused_code: UnusedCodeMetrics;
}

export interface RuleStatistic {
  rule_id: string;
  count: number;
  errors: number;
  warnings: number;
}

export interface FileStatistic {
  file_path: string;
  loc: number;
  errors: number;
  warnings: number;
  issues: number;
}

export interface AnalysisResult {
  result_id: string;
  job_id: string;
  repository: string;
  pull_request_number: number;
  commit_sha: string;
  branch: string;
  status: "completed" | "failed";
  findings: Finding[];
  metrics: AnalysisMetrics;
  rule_statistics: RuleStatistic[];
  file_statistics: FileStatistic[];
  /* Absent on results stored before analysis-engine tracked PR changes. */
  changes?: PullRequestChanges | null;
  /* Absent when no AI review was attempted for this result. */
  review?: AgentReview | null;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export async function getRepositoryAnalysis(
  owner: string,
  repo: string,
  limit = 10
): Promise<AnalysisResult[]> {
  const body = await request<{ repository: string; results: AnalysisResult[] }>(
    `/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/analysis?limit=${limit}`
  );
  return body.results;
}

/**
 * The single full result (findings + metrics) for one pull request.
 * Throws ApiError with statusCode 404 if this PR hasn't been analyzed yet.
 */
export function getPullRequestAnalysis(
  owner: string,
  repo: string,
  pullRequestNumber: number
): Promise<AnalysisResult> {
  return request<AnalysisResult>(
    `/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/analysis/pull-requests/${pullRequestNumber}`
  );
}

// ---------------------------------------------------------------------
// Business rules (analysis-engine's domain/business_rule.py)
// ---------------------------------------------------------------------

export interface BusinessRule {
  rule_id: string;
  rule: string;
  applies_to: string[];
  severity: "high" | "medium" | "low";
  rationale: string | null;
  source: "repository_file" | "dashboard" | "suggested";
  status: "active" | "suggested" | "rejected";
  evidence: string | null;
}

export type NewBusinessRule = Pick<BusinessRule, "rule_id" | "rule" | "applies_to" | "severity"> & {
  rationale?: string | null;
};

function rulesPath(owner: string, repo: string, ruleId?: string): string {
  const base = `/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/rules`;
  return ruleId ? `${base}/${encodeURIComponent(ruleId)}` : base;
}

export function getRules(owner: string, repo: string): Promise<{ rules: BusinessRule[]; mining: boolean }> {
  return request(rulesPath(owner, repo));
}

export function addRule(owner: string, repo: string, rule: NewBusinessRule): Promise<BusinessRule> {
  return request(rulesPath(owner, repo), { method: "POST", body: JSON.stringify(rule) });
}

export function updateRule(
  owner: string,
  repo: string,
  ruleId: string,
  change: Partial<Pick<BusinessRule, "rule" | "applies_to" | "severity" | "rationale" | "status">>
): Promise<BusinessRule> {
  return request(rulesPath(owner, repo, ruleId), { method: "PATCH", body: JSON.stringify(change) });
}

export function deleteRule(owner: string, repo: string, ruleId: string): Promise<void> {
  return request(rulesPath(owner, repo, ruleId), { method: "DELETE" });
}

export function suggestRules(owner: string, repo: string, branch = "main"): Promise<{ status: string }> {
  return request(`${rulesPath(owner, repo)}/suggest`, { method: "POST", body: JSON.stringify({ branch }) });
}

// ---------------------------------------------------------------------
// AI review feedback and usage
// ---------------------------------------------------------------------

export function giveFeedback(
  repository: string,
  pullRequestNumber: number,
  fingerprint: string,
  verdict: FeedbackVerdict
): Promise<void> {
  const [owner, repo] = repository.split("/");
  return request(
    `/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/analysis/pull-requests/` +
      `${pullRequestNumber}/review/findings/${encodeURIComponent(fingerprint)}/feedback`,
    { method: "PUT", body: JSON.stringify({ verdict }) }
  );
}

export interface ReviewUsage {
  repository: string;
  days: number;
  reviews: number;
  completed: number;
  failed: number;
  skipped: number;
  cost_usd: number;
  cost_per_review_usd: number | null;
  issues_reported: number;
  feedback: { useful: number; not_useful: number; wrong: number };
  wrong_rate: number | null;
  useful_rate: number | null;
}

export function getReviewUsage(owner: string, repo: string, days = 30): Promise<ReviewUsage> {
  return request(`/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/review-usage?days=${days}`);
}
