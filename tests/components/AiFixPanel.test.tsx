import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AiFixPanel from "@/components/ai/AiFixPanel";
import AnalysisDashboard from "@/components/analysis/AnalysisDashboard";
import { aiRequest } from "@/lib/aiSuggestions";
import type { AnalysisResult } from "@/lib/api";
import type { FixJob } from "@/lib/aiTypes";
import fixture from "../fixtures/analysis.json";

vi.mock("@/lib/aiSuggestions", () => ({ aiRequest: vi.fn(), activeJob: () => false }));

const result = fixture as AnalysisResult;
const job = {
  id: "a".repeat(64),
  status: "patch_ready",
  findings: [],
  suggestions: [],
  selectedFindingIds: [],
  patch: "--- a/file.js\n+++ b/file.js",
  changedFiles: ["file.js"],
  validation: null,
} as unknown as FixJob;

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
  vi.mocked(aiRequest).mockResolvedValue({ job });
});

describe("AI fixing workflow", () => {
  it("shows a simple four-column selection table without individual fix actions", () => {
    render(<AiFixPanel result={result} fixing />);

    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    expect(screen.getByRole("columnheader", { name: "Select" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Rule / location" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Suggestion" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filter by severity" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Generate AI suggestions" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Fix it:/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fix selected (0)" })).toBeDisabled();
  });

  it("keeps selections while filtering by severity and submits all selected IDs", async () => {
    const user = userEvent.setup();
    render(<AiFixPanel result={result} fixing />);
    const errorFinding = result.findings.find((finding) => finding.severity === "error")!;
    const warningFinding = result.findings.find((finding) => finding.severity === "warning")!;

    await user.click(screen.getByRole("checkbox", { name: `Select ${errorFinding.finding_id}` }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Filter by severity" }), "warning");
    expect(screen.queryByRole("checkbox", { name: `Select ${errorFinding.finding_id}` })).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: `Select ${warningFinding.finding_id}` }));
    await user.click(screen.getByRole("button", { name: "Fix selected (2)" }));

    expect(aiRequest).toHaveBeenCalledWith(
      "jobs",
      expect.objectContaining({
        selectedFindingIds: [errorFinding.finding_id, warningFinding.finding_id],
        headSha: result.commit_sha,
      })
    );
  });

  it("uses the AI explanation as the human-readable suggestion when available", async () => {
    const finding = result.findings[0];
    const explanation = "This variable is created but never used, so it can be safely removed.";
    vi.mocked(aiRequest).mockResolvedValue({
      job: {
        ...job,
        suggestions: [
          {
            findingId: finding.finding_id,
            classification: "issue",
            explanation,
            priority: "medium",
            severity: finding.severity,
            confidence: 0.95,
            debtImpact: "Removes unnecessary code.",
            suggestedFix: "Delete the unused declaration.",
            fixAvailable: true,
          },
        ],
      },
    });

    const user = userEvent.setup();
    render(<AiFixPanel result={result} fixing />);
    await user.click(screen.getByRole("checkbox", { name: `Select ${finding.finding_id}` }));
    await user.click(screen.getByRole("button", { name: "Fix selected (1)" }));

    expect(await screen.findByText(explanation)).toBeInTheDocument();
  });

  it("reports an unavailable AI service and offers no merge control", async () => {
    vi.mocked(aiRequest).mockRejectedValue(new Error("AI service unavailable"));
    const user = userEvent.setup(); render(<AiFixPanel result={result} fixing />);
    await user.click(screen.getByRole("checkbox", { name: `Select ${result.findings[0].finding_id}` }));
    await user.click(screen.getByRole("button", { name: "Fix selected (1)" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("AI service unavailable");
    expect(screen.queryByRole("button", { name: /merge/i })).not.toBeInTheDocument();
  });

  it("is absent from the analysis dashboard, which reads the review and nothing more", () => {
    // The panel used to render at the bottom of every pull request's
    // analysis. It lives only on the AI Code Fixing page now, so this page
    // shows the review and the metrics it always did.
    render(<AnalysisDashboard result={result} />);

    expect(screen.queryByRole("button", { name: "Generate AI suggestions" })).not.toBeInTheDocument();
    expect(screen.queryByText("AI suggestions")).not.toBeInTheDocument();

    // The sections it sat beneath are untouched.
    expect(screen.getByText("Files Analyzed")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rule Distribution" })).toBeInTheDocument();
  });

  it("requires an explicit confirmation before requesting a merge", async () => {
    vi.mocked(aiRequest).mockResolvedValue({
      job: {
        ...job,
        status: "pull_request_created",
        commitSha: "b".repeat(40),
        fixBranch: "ai-fixes/1/job",
        targetBranch: "feature",
        createdPullRequestNumber: 5,
        pullRequestUrl: "https://github.com/org/repo/pull/5",
      },
    });
    const finding = result.findings[0];
    const user = userEvent.setup();
    render(<AiFixPanel result={result} fixing />);
    await user.click(screen.getByRole("checkbox", { name: `Select ${finding.finding_id}` }));
    await user.click(screen.getByRole("button", { name: "Fix selected (1)" }));
    await user.click(await screen.findByRole("button", { name: "Review merge confirmation" }));
    expect(screen.getByRole("dialog", { name: "Confirm fix merge" })).toBeInTheDocument();
    expect(aiRequest).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Confirm merge" }));
    await waitFor(() =>
      expect(aiRequest).toHaveBeenCalledWith(`jobs/${job.id}/merge`, {
        confirm: true,
        commitSha: "b".repeat(40),
      })
    );
  });

  it("removes finding selection after the PR is merged or no longer fixable", async () => {
    vi.mocked(aiRequest).mockResolvedValue({
      job: { ...job, status: "already_fixed", patch: null,
        error: { code: "already_fixed", message: "The original pull request is no longer open." } },
    });
    const finding = result.findings[0];
    const user = userEvent.setup();
    render(<AiFixPanel result={result} fixing />);
    await user.click(screen.getByRole("checkbox", { name: `Select ${finding.finding_id}` }));
    await user.click(screen.getByRole("button", { name: "Fix selected (1)" }));

    expect(await screen.findByText(/closed, merged, or has no current findings/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Fix selected/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("shows empty and unauthorized states", async () => {
    const { unmount } = render(<AiFixPanel result={{ ...result, findings: [] }} fixing />);
    expect(screen.getByText("No findings available for this pull request.")).toBeInTheDocument();
    unmount();

    vi.mocked(aiRequest).mockRejectedValue(new Error("Unauthorized: sign in first."));
    const finding = result.findings[0];
    render(<AiFixPanel result={result} fixing />);
    await userEvent.click(screen.getByRole("checkbox", { name: `Select ${finding.finding_id}` }));
    await userEvent.click(screen.getByRole("button", { name: "Fix selected (1)" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized");
  });
});
