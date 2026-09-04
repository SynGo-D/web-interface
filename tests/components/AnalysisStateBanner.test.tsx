import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoadingBanner, ErrorBanner, EmptyBanner } from "@/components/analysis/AnalysisStateBanner";

describe("AnalysisStateBanner", () => {
  it("LoadingBanner shows the given loading message", () => {
    render(<LoadingBanner message="Loading analysis metrics..." />);
    expect(screen.getByText("Loading analysis metrics...")).toBeInTheDocument();
  });

  it("ErrorBanner shows the error message and invokes retry on click", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorBanner message="Unable to load analysis results." onRetry={onRetry} />);

    expect(screen.getByText("Unable to load analysis results.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("ErrorBanner renders without a retry button when none is provided", () => {
    render(<ErrorBanner message="Something went wrong." />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("EmptyBanner shows the given empty-state message", () => {
    render(<EmptyBanner message="No analysis results yet." />);
    expect(screen.getByText("No analysis results yet.")).toBeInTheDocument();
  });
});
