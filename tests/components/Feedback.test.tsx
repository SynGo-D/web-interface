import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FeedbackButtons from "@/components/analysis/FeedbackButtons";
import ReviewUsagePanel from "@/components/rules/ReviewUsagePanel";
import * as api from "@/lib/api";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return { ...actual, getReviewUsage: vi.fn() };
});

describe("FeedbackButtons", () => {
  it("records a verdict, highlights it and updates the counts", async () => {
    const onFeedback = vi.fn(async () => undefined);
    const user = userEvent.setup();
    render(<FeedbackButtons feedback={{ useful: 2, not_useful: 0, wrong: 0, mine: null }} onFeedback={onFeedback} />);

    await user.click(screen.getByRole("button", { name: /Wrong/ }));

    expect(onFeedback).toHaveBeenCalledWith("wrong");
    expect(screen.getByRole("button", { name: "✗ Wrong 1" })).toHaveAttribute("aria-pressed", "true");
  });

  it("moves your vote rather than adding a second one", async () => {
    const user = userEvent.setup();
    render(<FeedbackButtons feedback={{ useful: 1, not_useful: 0, wrong: 0, mine: "useful" }} onFeedback={vi.fn(async () => undefined)} />);

    await user.click(screen.getByRole("button", { name: /Not useful/ }));

    expect(screen.getByRole("button", { name: "👍 Useful" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "👎 Not useful 1" })).toHaveAttribute("aria-pressed", "true");
  });

  it("undoes the change and says so when saving fails", async () => {
    const user = userEvent.setup();
    render(<FeedbackButtons feedback={null} onFeedback={vi.fn(async () => { throw new Error("offline"); })} />);

    await user.click(screen.getByRole("button", { name: /Useful/ }));

    await waitFor(() => expect(screen.getByText("Couldn't save your rating.")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "👍 Useful" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("ReviewUsagePanel", () => {
  it("shows reviews, cost, issues and the share marked wrong", async () => {
    vi.mocked(api.getReviewUsage).mockResolvedValue({
      repository: "acme/shop", days: 30, reviews: 12, completed: 10, failed: 1, skipped: 1, cost_usd: 0.0183,
      cost_per_review_usd: 0.00183, issues_reported: 9, feedback: { useful: 6, not_useful: 1, wrong: 1 },
      wrong_rate: 0.125, useful_rate: 0.75,
    });
    render(<ReviewUsagePanel owner="acme" repo="shop" />);

    expect(await screen.findByText("$0.0183")).toBeInTheDocument();
    expect(screen.getByText("13%")).toBeInTheDocument();
    expect(screen.getByText(/10 completed, 1 failed, 1 skipped/)).toBeInTheDocument();
  });
});
