import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RuleStatisticsTable from "@/components/analysis/RuleStatisticsTable";
import rulesFixture from "../fixtures/rules.json";

function firstDataRowRuleId() {
  const rows = screen.getAllByRole("row");
  // rows[0] is the header row
  return within(rows[1]).getByText(/^[a-z@/-]+$/).textContent;
}

describe("RuleStatisticsTable", () => {
  it("renders every rule with its count/errors/warnings", () => {
    render(<RuleStatisticsTable ruleStatistics={rulesFixture} />);

    expect(screen.getByText("no-unused-vars")).toBeInTheDocument();
    expect(screen.getByText("complexity")).toBeInTheDocument();
    expect(screen.getByText("no-console")).toBeInTheDocument();
  });

  it("defaults to sorting by count, most-frequent first", () => {
    render(<RuleStatisticsTable ruleStatistics={rulesFixture} />);
    expect(firstDataRowRuleId()).toBe("no-unused-vars");
  });

  it("re-sorts by rule ID when that column header is clicked", async () => {
    const user = userEvent.setup();
    render(<RuleStatisticsTable ruleStatistics={rulesFixture} />);

    await user.click(screen.getByRole("button", { name: /Rule/ }));

    expect(firstDataRowRuleId()).toBe("complexity");
  });

  it("shows an empty state when there are no rule violations", () => {
    render(<RuleStatisticsTable ruleStatistics={[]} />);
    expect(screen.getByText("No rule violations in this analysis.")).toBeInTheDocument();
  });
});
