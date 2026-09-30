import { getToken } from "./session";

// Data access for technical debt, through main-backend. `repository` is
// "owner/repo".
//
// It goes through main-backend rather than a Next proxy route deliberately.
// technical-debt-service has no authentication of its own, and the proxy
// this replaced forwarded the browser to it with no session check — which
// made every organisation's remediation costs, file paths and security
// counts readable by anyone who could guess owner/repo. main-backend's
// repository router applies requireAuth and requireRepositoryAccess to
// everything under /:owner/:repo, so these inherit the same tenant check
// as the analysis routes. A Next route handler cannot do that: the session
// token lives in browser storage, which the server never sees.

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_MAIN_BACKEND_URL ?? "http://localhost:5000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/api/repositories/${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    // main-backend answers with {message}; a detail can still arrive from
    // the debt service through an UpstreamServiceError.
    throw new TechnicalDebtApiError(
      body.message ?? body.detail ?? body.error ?? `HTTP ${response.status}`,
      response.status
    );
  }

  return body as T;
}

// 404 (TechnicalDebtApiError.status) = no debt reviews for this repository yet.
export function getDebtSummary(repository: string) {
  return request<DebtSummary>(`${repository}/debt/summary`);
}

export function getPullRequestDebt(repository: string, pullRequestNumber: number) {
  return request<DebtReview>(
    `${repository}/debt/pull-requests/${pullRequestNumber}`
  );
}

export function getDebtHistory(repository: string, limit = 20) {
  return request<{ repository: string; reviews: DebtReview[] }>(
    `${repository}/debt?limit=${limit}`
  );
}

// Reads the PR's latest completed analysis from analysis-engine, runs the
// agents and stores the result. Slow: two LLM calls per finding.
// 404 = analysis-engine has no completed analysis for this PR.
export function calculatePullRequestDebt(repository: string, pullRequestNumber: number) {
  return request<DebtCalculation>(
    `${repository}/debt/pull-requests/${pullRequestNumber}/calculate`,
    { method: "POST" }
  );
}
