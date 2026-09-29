// Data access for the technical-debt service, via the /api/technical-debt proxy
// route. `repository` is "owner/repo".

export type HealthStatus = "HEALTHY" | "GOOD" | "NEEDS_ATTENTION" | "CRITICAL";

export type Risk = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface DebtIssue {
  id: string;
  finding_id: string;
  file_path: string;
  line: number | null;
  tool: string;
  rule_id: string | null;
  debt_type: string;
  impact: string;
  risk: Risk;
  estimated_minutes: number;
  confidence: number | null;
  recommendation: string | null;
}

export interface DebtReview {
  id: string;
  repository: string;
  pull_request_number: number;
  commit_sha: string;
  total_findings: number;
  total_debt_minutes: number;
  total_debt_hours: number;
  estimated_cost: number | null;
  // Debt minutes per changed line; null when the PR diff was unavailable.
  debt_ratio: number | null;
  health_score: number;
  health_status: HealthStatus;
  critical_issues: number;
  high_risk_issues: number;
  medium_risk_issues: number;
  low_risk_issues: number;
  security_issues: number;
  bugs: number;
  maintainability_issues: number;
  created_at: string;
  issues?: DebtIssue[];
}

export interface DebtSummary {
  repository: string;
  pull_requests_analyzed: number;
  total_findings: number;
  total_debt_minutes: number;
  total_debt_hours: number;
  estimated_cost: number;
  average_health_score: number;
  risk_counts: Record<Risk, number>;
  by_type: { debt_type: string; count: number; minutes: number }[];
  top_issues: (DebtIssue & { pull_request_number: number })[];
  // Latest review per pull request, newest first.
  pull_requests: DebtReview[];
  // Oldest -> newest, for plotting left to right.
  trend: {
    created_at: string;
    pull_request_number: number;
    commit_sha: string;
    health_score: number;
    total_debt_minutes: number;
  }[];
}

export interface DebtCalculation {
  review: DebtReview;
  findings_received: number;
  findings_skipped: number;
}

export class TechnicalDebtApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/technical-debt/${path}`, {
    cache: "no-store",
    ...init,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new TechnicalDebtApiError(
      body.detail ?? body.error ?? `HTTP ${response.status}`,
      response.status
    );
  }

  return body as T;
}

// 404 (TechnicalDebtApiError.status) = no debt reviews for this repository yet.
export function getDebtSummary(repository: string) {
  return request<DebtSummary>(`repositories/${repository}/debt/summary`);
}

export function getPullRequestDebt(repository: string, pullRequestNumber: number) {
  return request<DebtReview>(
    `repositories/${repository}/debt/pull-requests/${pullRequestNumber}`
  );
}

export function getDebtHistory(repository: string, limit = 20) {
  return request<{ repository: string; reviews: DebtReview[] }>(
    `repositories/${repository}/debt?limit=${limit}`
  );
}

export function getDebtRepositories() {
  return request<{ repositories: string[] }>("debt/repositories");
}

// Reads the PR's latest completed analysis from analysis-engine, runs the
// agents and stores the result. Slow: two LLM calls per finding.
// 404 = analysis-engine has no completed analysis for this PR.
export function calculatePullRequestDebt(repository: string, pullRequestNumber: number) {
  return request<DebtCalculation>(
    `repositories/${repository}/debt/pull-requests/${pullRequestNumber}/calculate`,
    { method: "POST" }
  );
}
