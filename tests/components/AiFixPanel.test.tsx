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
const job = { id: "a".repeat(64), status: "patch_ready", findings: [], suggestions: [], selectedFindingIds: [], patch: "--- a/file.js\n+++ b/file.js", changedFiles: ["file.js"], validation: null } as unknown as FixJob;
beforeEach(() => { sessionStorage.clear(); vi.clearAllMocks(); vi.mocked(aiRequest).mockResolvedValue({ job }); });

describe("AI fixing workflow", () => {
  it("has left-side individual fixes and submits only selected finding IDs", async () => {
    const user = userEvent.setup(); render(<AiFixPanel result={result} fixing />);
    const finding = result.findings.find(f => f.line)!;
    await user.click(screen.getByRole("button", { name: `Fix it: ${finding.rule_id} at ${finding.file_path}:${finding.line}` }));
    expect(aiRequest).toHaveBeenCalledWith("jobs", expect.objectContaining({ selectedFindingIds: [finding.finding_id], headSha: result.commit_sha }));
    expect(await screen.findByText("Patch preview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create fix pull request" })).toBeDisabled();
  });
  it("combines checked findings", async () => {
    const user = userEvent.setup(); render(<AiFixPanel result={result} fixing />);
    const findings = result.findings.filter(f => f.line).slice(0, 2);
    for (const f of findings) await user.click(screen.getByRole("checkbox", { name: `Select ${f.finding_id}` }));
    await user.click(screen.getByRole("button", { name: `Fix selected (${findings.length})` }));
    expect(aiRequest).toHaveBeenCalledWith("jobs", expect.objectContaining({ selectedFindingIds: findings.map(f => f.finding_id) }));
  });
  it("reports an unavailable AI service and offers no merge control", async () => {
    vi.mocked(aiRequest).mockRejectedValue(new Error("AI service unavailable"));
    const user = userEvent.setup(); render(<AiFixPanel result={result} fixing />);
    await user.click(screen.getByRole("button", { name: "Generate AI suggestions" }));
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
    vi.mocked(aiRequest).mockResolvedValue({ job: { ...job, status: "pull_request_created", commitSha: "b".repeat(40),
      fixBranch: "ai-fixes/1/job", targetBranch: "feature", createdPullRequestNumber: 5, pullRequestUrl: "https://github.com/org/repo/pull/5" } });
    const user = userEvent.setup(); render(<AiFixPanel result={result} fixing />);
    await user.click(screen.getByRole("button", { name: "Generate AI suggestions" }));
    await user.click(await screen.findByRole("button", { name: "Review merge confirmation" }));
    expect(screen.getByRole("dialog", { name: "Confirm fix merge" })).toBeInTheDocument();
    expect(aiRequest).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Confirm merge" }));
    await waitFor(() => expect(aiRequest).toHaveBeenCalledWith(`jobs/${job.id}/merge`, { confirm: true, commitSha: "b".repeat(40) }));
  });
  it("shows empty and unauthorized states", async () => {
    const { unmount } = render(<AiFixPanel result={{ ...result, findings: [] }} fixing />);
    expect(screen.getByText("No findings available for this pull request.")).toBeInTheDocument(); unmount();
    vi.mocked(aiRequest).mockRejectedValue(new Error("Unauthorized: sign in first."));
    render(<AiFixPanel result={result} fixing />);
    await userEvent.click(screen.getByRole("button", { name: "Generate AI suggestions" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized");
  });
});
