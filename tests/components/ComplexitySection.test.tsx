import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ComplexitySection from "@/components/analysis/ComplexitySection";
import metricsFixture from "../fixtures/metrics.json";

describe("ComplexitySection", () => {
  it("shows cyclomatic and cognitive complexity as two clearly separate, labeled sections", () => {
    render(
      <ComplexitySection
        complexity={metricsFixture.complexity}
        cognitiveComplexity={metricsFixture.cognitive_complexity}
      />
    );

    expect(screen.getByText("Cyclomatic Complexity")).toBeInTheDocument();
    expect(screen.getByText("Cognitive Complexity")).toBeInTheDocument();
  });

  it("renders average, maximum, and violation counts for both metrics", () => {
    render(
      <ComplexitySection
        complexity={metricsFixture.complexity}
        cognitiveComplexity={metricsFixture.cognitive_complexity}
      />
    );

    // Cyclomatic: average 14, maximum 18, violations 2
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Cognitive: average/maximum 21, violations 1
    expect(screen.getAllByText("21")).toHaveLength(2);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders a dash for average/maximum when nothing violated, distinct from a real 0 violation count", () => {
    render(
      <ComplexitySection
        complexity={{ violations: 0, maximum: null, average: null }}
        cognitiveComplexity={{ violations: 0, maximum: null, average: null }}
      />
    );

    // average + maximum, for both sections = 4 dashes
    expect(screen.getAllByText("—")).toHaveLength(4);
    // violations is a real, meaningful 0 (not "unmeasured") — still rendered as "0"
    expect(screen.getAllByText("0")).toHaveLength(2);
  });
});
