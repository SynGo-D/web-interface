import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import AnalysisDashboard from "@/components/analysis/AnalysisDashboard";
import completedFixture from "../fixtures/analysis.json";
import failedFixture from "../fixtures/analysis-failed.json";
import type { AnalysisResult } from "@/lib/api";

describe("AnalysisDashboard", () => {
  it("renders the full dashboard for a completed analysis: header, overview, complexity, density, findings", () => {
    render(<AnalysisDashboard result={completedFixture as AnalysisResult} />);

    // Header
    expect(screen.getByText("codepulse-web")).toBeInTheDocument();
    expect(screen.getByText("develop")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();

    // Overview cards
    expect(screen.getByText("Files Analyzed")).toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeInTheDocument(); // loc

    // Complexity, split into two sections
    expect(screen.getByText("Cyclomatic Complexity")).toBeInTheDocument();
    expect(screen.getByText("Cognitive Complexity")).toBeInTheDocument();

    // Density (heading — "Issue Density" also appears as an overview-card label)
    expect(screen.getByRole("heading", { name: "Issue Density" })).toBeInTheDocument();

    // Rule + file statistics
    expect(screen.getByText("Rule Distribution")).toBeInTheDocument();
    expect(screen.getByText("File Statistics")).toBeInTheDocument();

    // Findings
    expect(screen.getByText(/'foo' is assigned a value but never used/)).toBeInTheDocument();
  });

  it("shows only the header and an error banner for a failed analysis — never partial metrics", () => {
    render(<AnalysisDashboard result={failedFixture as AnalysisResult} />);

    expect(screen.getByText("Analysis failed")).toBeInTheDocument();
    expect(screen.getByText(/config error/)).toBeInTheDocument();

    // None of the metrics sections should render for a failed run.
    expect(screen.queryByText("Files Analyzed")).not.toBeInTheDocument();
    expect(screen.queryByText("Cyclomatic Complexity")).not.toBeInTheDocument();
    expect(screen.queryByText("Rule Distribution")).not.toBeInTheDocument();
  });
});
