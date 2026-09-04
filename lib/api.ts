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
