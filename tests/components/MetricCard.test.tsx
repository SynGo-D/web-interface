import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MetricCard from "@/components/analysis/MetricCard";

describe("MetricCard", () => {
  it("renders the label and value passed in", () => {
    render(<MetricCard label="Files Analyzed" value={120} />);

    expect(screen.getByText("Files Analyzed")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
  });

  it("renders a string value and an optional hint", () => {
    render(<MetricCard label="Issue Density" value="7.00" hint="issues / KLOC" />);

    expect(screen.getByText("7.00")).toBeInTheDocument();
    expect(screen.getByText("issues / KLOC")).toBeInTheDocument();
  });

  it("omits the hint entirely when none is passed", () => {
    render(<MetricCard label="Errors" value={4} />);

    expect(screen.queryByText("issues / KLOC")).not.toBeInTheDocument();
  });
});
