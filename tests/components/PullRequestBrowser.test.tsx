import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PullRequestBrowser from "@/components/analysis/PullRequestBrowser";
import * as api from "@/lib/api";
import metricsFixture from "../fixtures/metrics.json";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return { ...actual, listIntegrations: vi.fn(), getRepositoryAnalysis: vi.fn(), getPullRequestAnalysis: vi.fn() };
});

function integration(owner: string, name: string, id = `${owner}-${name}`): api.Integration {
  return {
    id, userId: "u1", provider: "github", repositoryUrl: `https://github.com/${owner}/${name}`,
    repositoryOwner: owner, repositoryName: name, status: "ACTIVE", webhookRegistered: true,
    createdAt: "2026-09-01T10:00:00Z", updatedAt: "2026-09-01T10:00:00Z",
  };
}

function result(number: number, overrides: Partial<api.AnalysisResult> = {}): api.AnalysisResult {
  return {
    result_id: `r${number}`, job_id: `j${number}`, repository: "acme/shop", pull_request_number: number,
    commit_sha: "abc123", branch: `feature-${number}`, status: "completed", findings: [],
    metrics: metricsFixture as api.AnalysisMetrics, rule_statistics: [], file_statistics: [],
    started_at: "2026-09-21T10:00:00Z", completed_at: "2026-09-21T10:01:00Z", error_message: null, ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(api.listIntegrations).mockResolvedValue([integration("acme", "shop"), integration("acme", "web")]);
  vi.mocked(api.getRepositoryAnalysis).mockResolvedValue([result(42), result(7), result(42)]);
  vi.mocked(api.getPullRequestAnalysis).mockImplementation(async (_o, _r, number) => result(number));
});

describe("PullRequestBrowser", () => {
  it("lists connected repositories and their analysed pull requests, newest first", async () => {
    render(<PullRequestBrowser />);

    const [repoSelect, prSelect] = await screen.findAllByRole("combobox");
    expect([...repoSelect.querySelectorAll("option")].map((o) => o.textContent)).toEqual(["acme/shop", "acme/web"]);
    // One entry per PR (the repeated run of #42 collapses), highest number first.
    await waitFor(() =>
      expect([...prSelect.querySelectorAll("option")].map((o) => o.textContent?.split(" ")[0])).toEqual(["#42", "#7"])
    );
  });

  it("opens the newest pull request's analysis by default", async () => {
    render(<PullRequestBrowser />);

    await waitFor(() => expect(api.getPullRequestAnalysis).toHaveBeenCalledWith("acme", "shop", 42));
    expect(await screen.findByText(/PR #42/)).toBeInTheDocument();
  });

  it("loads the analysis of whichever pull request is selected", async () => {
    const user = userEvent.setup();
    render(<PullRequestBrowser />);
    const prSelect = (await screen.findAllByRole("combobox"))[1];
    await waitFor(() => expect(prSelect.querySelectorAll("option").length).toBe(2));

    await user.selectOptions(prSelect, "7");

    await waitFor(() => expect(api.getPullRequestAnalysis).toHaveBeenCalledWith("acme", "shop", 7));
  });

  it("reloads the pull request list when the repository changes", async () => {
    const user = userEvent.setup();
    render(<PullRequestBrowser />);
    const repoSelect = (await screen.findAllByRole("combobox"))[0];

    await user.selectOptions(repoSelect, "acme/web");

    await waitFor(() => expect(api.getRepositoryAnalysis).toHaveBeenCalledWith("acme", "web", 50));
  });

  it("says so when a repository has no analysed pull requests", async () => {
    vi.mocked(api.getRepositoryAnalysis).mockResolvedValue([]);
    render(<PullRequestBrowser />);

    expect(await screen.findByText(/No pull request of acme\/shop has been analysed yet/)).toBeInTheDocument();
  });

  it("points a project with no repositories at the Repositories page", async () => {
    vi.mocked(api.listIntegrations).mockResolvedValue([]);
    render(<PullRequestBrowser />);

    expect(await screen.findByText(/No repositories in this project yet/)).toBeInTheDocument();
  });

  it("asks only for the chosen project's repositories", async () => {
    render(<PullRequestBrowser organizationId="org-1" projectId="project-1" />);

    await waitFor(() => expect(api.listIntegrations).toHaveBeenCalledWith("org-1", "project-1"));
  });

  it("shows the error message when loading fails", async () => {
    vi.mocked(api.listIntegrations).mockRejectedValue(new api.ApiError("Session expired.", 401));
    render(<PullRequestBrowser />);

    expect(await screen.findByText("Session expired.")).toBeInTheDocument();
  });
});
