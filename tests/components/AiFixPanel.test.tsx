import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AiFixPanel from "@/components/ai/AiFixPanel";
import AnalysisDashboard from "@/components/analysis/AnalysisDashboard";
import { aiRequest } from "@/lib/aiSuggestions";
import type { AnalysisResult } from "@/lib/api";
import type { SuggestionJob } from "@/lib/aiTypes";
import fixture from "../fixtures/analysis.json";

vi.mock("@/lib/aiSuggestions", () => ({ aiRequest: vi.fn(), activeSuggestionJob: () => false }));

const result = { ...fixture, repository: "acme/shop" } as AnalysisResult;
const job: SuggestionJob = {
  id: "a".repeat(64),
  status: "patch_ready",
  findings: [],
  suggestions: [],
  error: null,
};

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
  vi.mocked(aiRequest).mockResolvedValue({ job });
});

describe("AI suggestion workflow", () => {
  it("contains no selection, patch, pull-request, or merge controls", () => {
    render(<AiFixPanel result={result} standalone />);

    expect(screen.getByRole("button", { name: "Generate AI suggestions" })).toBeEnabled();
    expect(screen.getByText(/does not modify code or create pull requests/i)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Fix selected/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Validate patch/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Create fix pull request/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /merge/i })).not.toBeInTheDocument();
  });

  it("requests suggestions for all findings without selecting fixes", async () => {
    const user = userEvent.setup();
    render(<AiFixPanel result={result} standalone />);

    await user.click(screen.getByRole("button", { name: "Generate AI suggestions" }));

    expect(aiRequest).toHaveBeenCalledWith("jobs", {
      owner: "acme",
      repository: "shop",
      pullRequestNumber: result.pull_request_number,
      headSha: result.commit_sha,
      selectedFindingIds: [],
    });
  });

  it("shows the AI explanation, debt impact, and suggested correction", async () => {
    const finding = result.findings[0];
    vi.mocked(aiRequest).mockResolvedValue({
      job: {
        ...job,
        suggestions: [
          {
            findingId: finding.finding_id,
            classification: "issue",
            explanation: "This variable is created but never used.",
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

    await userEvent.click(
      render(<AiFixPanel result={result} standalone />).getByRole("button", {
        name: "Generate AI suggestions",
      })
    );

    expect(await screen.findByText("This variable is created but never used.")).toBeInTheDocument();
    expect(screen.getByText(/Removes unnecessary code/)).toBeInTheDocument();
    expect(screen.getByText(/Delete the unused declaration/)).toBeInTheDocument();
  });

  it("keeps existing analysis visible when the AI service is unavailable", async () => {
    vi.mocked(aiRequest).mockRejectedValue(new Error("AI service unavailable"));
    render(<AnalysisDashboard result={result} />);

    await userEvent.click(screen.getByRole("button", { name: "Generate AI suggestions" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("AI service unavailable");
    expect(screen.getByText("Files Analyzed")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Rule Distribution" })).toBeInTheDocument();
  });

  it("retries failed suggestion generation", async () => {
    const failed: SuggestionJob = {
      ...job,
      status: "failed",
      error: { code: "service_unavailable", message: "Suggestion generation failed." },
    };
    vi.mocked(aiRequest)
      .mockResolvedValueOnce({ job: failed })
      .mockResolvedValueOnce({ job: { ...failed, status: "queued", error: null } });
    render(<AiFixPanel result={result} standalone />);

    await userEvent.click(screen.getByRole("button", { name: "Generate AI suggestions" }));
    await userEvent.click(await screen.findByRole("button", { name: "Retry suggestions" }));

    expect(aiRequest).toHaveBeenLastCalledWith(`jobs/${job.id}/retry`, {});
  });

  it("shows the page link only inside the full analysis dashboard", () => {
    const { unmount } = render(<AiFixPanel result={result} standalone />);
    expect(screen.queryByRole("link", { name: "Open AI Code Suggestion →" })).not.toBeInTheDocument();
    unmount();

    render(<AiFixPanel result={result} />);
    expect(screen.getByRole("link", { name: "Open AI Code Suggestion →" })).toHaveAttribute(
      "href",
      `/developer/ai-fixing?repository=acme%2Fshop&pr=${result.pull_request_number}`
    );
  });

  it("shows empty and unauthorized states", async () => {
    const { unmount } = render(<AiFixPanel result={{ ...result, findings: [] }} standalone />);
    expect(screen.getByText("No findings available for this pull request.")).toBeInTheDocument();
    unmount();

    vi.mocked(aiRequest).mockRejectedValue(new Error("Unauthorized: sign in first."));
    render(<AiFixPanel result={result} standalone />);
    await userEvent.click(screen.getByRole("button", { name: "Generate AI suggestions" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized");
  });
});
