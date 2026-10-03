import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/developer/dashboard/page";
import { saveSession } from "@/lib/session";
import { clearWorkspace, saveWorkspace } from "@/lib/workspace";
import { TechnicalDebtApiError } from "@/lib/technicalDebtApi";
import type { AnalysisResult, Contributor, Integration } from "@/lib/api";

vi.mock("next/navigation", () => ({ usePathname: () => "/developer/dashboard" }));

const listIntegrations = vi.fn();
const getRepositoryAnalysis = vi.fn();
const getContributors = vi.fn();
vi.mock("@/lib/api", async () => ({
  ...(await vi.importActual<typeof import("@/lib/api")>("@/lib/api")),
  listIntegrations: () => listIntegrations(),
  getRepositoryAnalysis: (owner: string, repo: string) => getRepositoryAnalysis(owner, repo),
  getContributors: (owner: string, repo: string) => getContributors(owner, repo),
}));

const getDebtSummary = vi.fn();
vi.mock("@/lib/technicalDebtApi", async () => ({
  ...(await vi.importActual<typeof import("@/lib/technicalDebtApi")>("@/lib/technicalDebtApi")),
  getDebtSummary: (repository: string) => getDebtSummary(repository),
}));

function integration(): Integration {
  return {
    id: "i1", userId: "u1", provider: "github",
    repositoryUrl: "https://github.com/acme/shop",
    repositoryOwner: "acme", repositoryName: "shop",
    status: "ACTIVE", webhookRegistered: true,
    createdAt: "", updatedAt: "",
  };
}

function analysis(): AnalysisResult {
  return {
    result_id: "r1", job_id: "j1", repository: "acme/shop",
    pull_request_number: 42, commit_sha: "a".repeat(40), branch: "feature/x",
    status: "completed", findings: [],
    metrics: {
      files_analyzed: 12, loc: 900, errors: 3, warnings: 5, total_issues: 8,
      error_density: 3.3, warning_density: 5.5, issue_density: 8.9,
      complexity: { violations: 0, maximum: null, average: null },
      cognitive_complexity: { violations: 0, maximum: null, average: null },
      size: { largest_file_lines: 100, largest_function_lines: null, max_lines_violations: 0, max_lines_per_function_violations: 0 },
      unused_code: { unused_variables: 0, unreachable_code: 0 },
    } as AnalysisResult["metrics"],
    rule_statistics: [], file_statistics: [],
    started_at: "2026-09-27T00:00:00.000Z",
    completed_at: "2026-09-27T00:01:00.000Z",
    error_message: null,
  };
}

function contributor(overrides: Partial<Contributor> = {}): Contributor {
  return {
    username: "amara", provider_user_id: "77",
    pull_requests: 3, pull_request_numbers: [42], analyses: 3,
    files_changed: 12, lines_added: 430, lines_removed: 120,
    issues: 9, errors: 2, warnings: 7,
    review_findings: { high: 1, medium: 2, low: 1 },
    debt: { score: 600, status: "available", introduced_at: null },
    last_analysis_at: "2026-09-27T00:00:00.000Z",
    ...overrides,
  };
}

function debtSummary() {
  return {
    repository: "acme/shop", pull_requests_analyzed: 1, total_findings: 8,
    total_debt_minutes: 600, total_debt_hours: 10, estimated_cost: 250,
    average_health_score: 72, risk_counts: { CRITICAL: 0, HIGH: 2, MEDIUM: 3, LOW: 3 },
    by_type: [{ debt_type: "MAINTAINABILITY", count: 8, minutes: 600 }],
    top_issues: [], pull_requests: [], trend: [],
    latest_pull_request: {
      pull_request_number: 42, total_debt_minutes: 600, total_debt_hours: 10,
      estimated_cost: 250, health_score: 72, created_at: "2026-09-27T00:00:00.000Z",
    },
  };
}

function signedIn() {
  saveSession("token", { userId: "u1", email: "a@b.c", fullName: "A B" });
  saveWorkspace({
    organizationId: "org-1", organizationName: "Acme", role: "DEVELOPER",
    projectId: "project-1", projectName: "Shop",
  });
}

beforeEach(() => {
  localStorage.clear();
  clearWorkspace();
  vi.clearAllMocks();
  listIntegrations.mockResolvedValue([integration()]);
  getRepositoryAnalysis.mockResolvedValue([analysis()]);
  getContributors.mockResolvedValue({ repository: "acme/shop", contributors: [contributor()], debt_source: "technical-debt-service" });
  getDebtSummary.mockResolvedValue(debtSummary());
});

describe("Dashboard", () => {
  it("asks for a project before loading anything", async () => {
    saveSession("token", { userId: "u1", email: "a@b.c", fullName: "A B" });

    render(<DashboardPage />);

    // The sidebar also says "Choose a project", so match the banner exactly.
    expect(await screen.findByText("Choose a project to see its dashboard.")).toBeInTheDocument();
    expect(listIntegrations).not.toHaveBeenCalled();
  });

  it("shows code quality, debt and contributors together", async () => {
    signedIn();

    render(<DashboardPage />);

    expect(await screen.findByText("Code quality")).toBeInTheDocument();
    expect(await screen.findByText("Technical debt")).toBeInTheDocument();
    expect(await screen.findByText("Top contributors")).toBeInTheDocument();
    expect(screen.getByText("Total technical debt")).toBeInTheDocument();
    // From OverviewCards, so the real metrics reached the real component.
    expect(screen.getByText("Files Analyzed")).toBeInTheDocument();
    // The finding list and the health trend belong to the pages built for
    // them; the dashboard summarises rather than repeats.
    expect(screen.queryByText("Recent findings")).not.toBeInTheDocument();
    expect(screen.queryByText(/Health & Debt Trend/i)).not.toBeInTheDocument();
  });

  it("invites a calculation when no debt has been measured, rather than showing zeros", async () => {
    // A health score of 0 is a real and alarming value. A repository
    // nobody has costed must not be made to look like one.
    getDebtSummary.mockRejectedValue(new TechnicalDebtApiError("no reviews", 404));
    signedIn();

    render(<DashboardPage />);

    expect(await screen.findByText(/No debt has been calculated/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Calculate it/ })).toHaveAttribute("href", "/developer/debt");
  });

  it("keeps the quality half when the debt service is down", async () => {
    getDebtSummary.mockRejectedValue(new TechnicalDebtApiError("upstream", 502));
    signedIn();

    render(<DashboardPage />);

    expect(await screen.findByText(/isn't reachable right now/)).toBeInTheDocument();
    // The point of the split: metrics still render.
    expect(screen.getByText("Code quality")).toBeInTheDocument();
  });

  it("keeps the rest of the page when contributors cannot be loaded", async () => {
    getContributors.mockRejectedValue(new Error("boom"));
    signedIn();

    render(<DashboardPage />);

    expect(await screen.findByText("Code quality")).toBeInTheDocument();
    expect(screen.queryByText("Top contributors")).not.toBeInTheDocument();
  });

  it("says so when the repository has no analyses yet", async () => {
    getRepositoryAnalysis.mockResolvedValue([]);
    signedIn();

    render(<DashboardPage />);

    expect(await screen.findByText(/No analysed pull requests in acme\/shop/)).toBeInTheDocument();
  });

  it("points at connecting a repository when the project has none", async () => {
    listIntegrations.mockResolvedValue([]);
    signedIn();

    render(<DashboardPage />);

    expect(await screen.findByText(/No repositories in this project yet/)).toBeInTheDocument();
  });
});
