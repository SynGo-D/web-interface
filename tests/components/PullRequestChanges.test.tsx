import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FindingsExplorer from "@/components/analysis/FindingsExplorer";
import PullRequestChangesSection from "@/components/analysis/PullRequestChangesSection";
import type { Finding, PullRequestChanges } from "@/lib/api";

function finding(id: string, message: string, onChangedLine?: boolean): Finding {
  return {
    finding_id: id, file_path: "src/cart.ts", line: 3, column: 1, severity: "warning",
    category: "code_smell", rule_id: "no-console", message, tool: "eslint",
    metadata: onChangedLine === undefined ? {} : { on_changed_line: onChangedLine },
  };
}

const findings = [
  finding("1", "Changed-line finding", true),
  finding("2", "Untouched-line finding", false),
];

describe("FindingsExplorer — pull request scope", () => {
  it("opens on the findings this PR introduced when PR changes are available", () => {
    render(<FindingsExplorer findings={findings} prScopeAvailable />);

    expect(screen.getByText("Changed-line finding")).toBeInTheDocument();
    expect(screen.queryByText("Untouched-line finding")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "In this PR (1)" })).toHaveAttribute("aria-pressed", "true");
  });

  it("switches to the whole repository", async () => {
    const user = userEvent.setup();
    render(<FindingsExplorer findings={findings} prScopeAvailable />);

    await user.click(screen.getByRole("button", { name: "Whole repository (2)" }));

    expect(screen.getByText("Untouched-line finding")).toBeInTheDocument();
  });

  it("says so plainly when the PR added no findings", () => {
    render(<FindingsExplorer findings={[finding("2", "Untouched-line finding", false)]} prScopeAvailable />);

    expect(screen.getByText("No findings on lines this pull request changed.")).toBeInTheDocument();
  });

  it("shows no scope toggle when PR changes aren't available", () => {
    render(<FindingsExplorer findings={findings} />);

    expect(screen.queryByRole("group", { name: "Findings scope" })).not.toBeInTheDocument();
    expect(screen.getByText("Untouched-line finding")).toBeInTheDocument();
  });
});

const available: PullRequestChanges = {
  status: "available",
  unavailable_reason: null,
  change_set: { base_sha: "b", head_sha: "h", target_branch: "main", files: [], excluded_files: ["package-lock.json"] },
  changed_symbols: [
    { symbol_id: "s1", name: "total", qualified_name: "Cart.total", kind: "method",
      file_path: "src/cart.ts", start_line: 12, end_line: 20, callers_count: 3 },
  ],
  files_changed: 4,
  lines_added: 85,
  lines_removed: 12,
  findings_on_changed_lines: 7,
};

describe("PullRequestChangesSection", () => {
  it("summarises the PR and lists changed functions with their callers", () => {
    render(<PullRequestChangesSection changes={available} />);

    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Cart.total")).toBeInTheDocument();
    expect(screen.getByText("src/cart.ts:12")).toBeInTheDocument();
    expect(screen.getByText(/1 generated file/)).toBeInTheDocument();
  });

  it("explains why changes are unavailable instead of showing zeros", () => {
    render(
      <PullRequestChangesSection
        changes={{ ...available, status: "unavailable", unavailable_reason: "no_target_branch",
                   change_set: null, changed_symbols: [] }}
      />
    );

    expect(screen.getByText(/didn't say which branch the pull request targets/)).toBeInTheDocument();
    expect(screen.queryByText("Files Changed")).not.toBeInTheDocument();
  });
});
