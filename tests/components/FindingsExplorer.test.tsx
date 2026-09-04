import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FindingsExplorer from "@/components/analysis/FindingsExplorer";
import findingsFixture from "../fixtures/findings.json";
import type { Finding } from "@/lib/api";

const findings = findingsFixture as Finding[];

describe("FindingsExplorer", () => {
  it("renders every finding's message, file, and severity", () => {
    render(<FindingsExplorer findings={findings} />);

    expect(screen.getByText(/'foo' is assigned a value but never used/)).toBeInTheDocument();
    expect(screen.getByText(/Unexpected console statement/)).toBeInTheDocument();
    expect(screen.getByText(/src\/controller\.ts/)).toBeInTheDocument();
  });

  it("renders each finding's severity", () => {
    render(<FindingsExplorer findings={findings} />);

    expect(screen.getAllByText("error").length).toBeGreaterThan(0);
    expect(screen.getByText("warning")).toBeInTheDocument();
  });

  it("shows an empty state when there are no findings at all", () => {
    render(<FindingsExplorer findings={[]} />);

    expect(screen.getByText("No findings in this analysis.")).toBeInTheDocument();
  });

  it("filters findings by severity", async () => {
    const user = userEvent.setup();
    render(<FindingsExplorer findings={findings} />);

    const severitySelect = screen.getAllByRole("combobox")[0];
    await user.selectOptions(severitySelect, "warning");

    expect(screen.getByText(/Unexpected console statement/)).toBeInTheDocument();
    expect(screen.queryByText(/'foo' is assigned a value but never used/)).not.toBeInTheDocument();
  });

  it("filters findings by file path substring", async () => {
    const user = userEvent.setup();
    render(<FindingsExplorer findings={findings} />);

    const fileInput = screen.getByPlaceholderText("Filter by file path…");
    await user.type(fileInput, "utils");

    expect(screen.getByText(/Function 'transform' has a complexity/)).toBeInTheDocument();
    expect(screen.queryByText(/Unexpected console statement/)).not.toBeInTheDocument();
  });

  it("shows a no-match message when filters exclude every finding", async () => {
    const user = userEvent.setup();
    render(<FindingsExplorer findings={findings} />);

    const fileInput = screen.getByPlaceholderText("Filter by file path…");
    await user.type(fileInput, "nonexistent-file");

    expect(screen.getByText("No findings match the current filters.")).toBeInTheDocument();
  });

  it("expands a finding's full detail on click", async () => {
    const user = userEvent.setup();
    render(<FindingsExplorer findings={findings} />);

    await user.click(screen.getByText(/'foo' is assigned a value but never used/));

    expect(screen.getByText("Line 14, Column 7")).toBeInTheDocument();
  });
});
