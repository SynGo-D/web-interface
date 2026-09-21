import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RulesManager from "@/components/rules/RulesManager";
import * as api from "@/lib/api";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof api>();
  return { ...actual, getRules: vi.fn(), addRule: vi.fn(), updateRule: vi.fn(), deleteRule: vi.fn(), suggestRules: vi.fn() };
});

const active: api.BusinessRule = {
  rule_id: "REFUND-APPROVAL", rule: "Refunds over $500 need a manager.", applies_to: ["payments/**"],
  severity: "high", rationale: null, source: "dashboard", status: "active", evidence: null,
};
const suggested: api.BusinessRule = {
  rule_id: "PII-LOGGING", rule: "Never log customer emails.", applies_to: [], severity: "high",
  rationale: "Privacy.", source: "suggested", status: "suggested", evidence: "src/log.py:3: logger.info(order.id)",
};

beforeEach(() => {
  vi.mocked(api.getRules).mockResolvedValue({ rules: [active, suggested], mining: false });
});

describe("RulesManager", () => {
  it("lists rules in force and suggestions with their source", async () => {
    render(<RulesManager owner="acme" repo="shop" />);

    expect(await screen.findByText("Refunds over $500 need a manager.")).toBeInTheDocument();
    expect(screen.getByText("Never log customer emails.")).toBeInTheDocument();
    expect(screen.getByText(/Source: src\/log.py:3/)).toBeInTheDocument();
    expect(screen.getByText("Applies to: all files")).toBeInTheDocument();
  });

  it("accepts a suggestion", async () => {
    const user = userEvent.setup();
    render(<RulesManager owner="acme" repo="shop" />);

    await user.click(await screen.findByRole("button", { name: "Accept" }));

    expect(api.updateRule).toHaveBeenCalledWith("acme", "shop", "PII-LOGGING", { status: "active" });
  });

  it("adds a rule, upper-casing its id and splitting the scope", async () => {
    const user = userEvent.setup();
    render(<RulesManager owner="acme" repo="shop" />);
    await screen.findByText("Refunds over $500 need a manager.");

    await user.type(screen.getByPlaceholderText(/ID, e.g./), "order-cancel");
    await user.type(screen.getByPlaceholderText(/The rule, e.g./), "Shipped orders can't be cancelled.");
    await user.type(screen.getByPlaceholderText(/Applies to/), "orders/**, api/orders.py");
    await user.click(screen.getByRole("button", { name: "Add rule" }));

    expect(api.addRule).toHaveBeenCalledWith("acme", "shop", {
      rule_id: "ORDER-CANCEL", rule: "Shipped orders can't be cancelled.", applies_to: ["orders/**", "api/orders.py"],
      severity: "medium", rationale: null,
    });
  });

  it("shows the engine's message when a request is refused", async () => {
    vi.mocked(api.addRule).mockRejectedValueOnce(new api.ApiError("Rule ORDER-CANCEL already exists.", 409));
    const user = userEvent.setup();
    render(<RulesManager owner="acme" repo="shop" />);
    await screen.findByText("Refunds over $500 need a manager.");

    await user.type(screen.getByPlaceholderText(/ID, e.g./), "ORDER-CANCEL");
    await user.type(screen.getByPlaceholderText(/The rule, e.g./), "Duplicate.");
    await user.click(screen.getByRole("button", { name: "Add rule" }));

    await waitFor(() => expect(screen.getByText("Rule ORDER-CANCEL already exists.")).toBeInTheDocument());
  });

  it("disables suggesting while the repository is being read", async () => {
    vi.mocked(api.getRules).mockResolvedValue({ rules: [], mining: true });
    render(<RulesManager owner="acme" repo="shop" />);

    expect(await screen.findByRole("button", { name: "Reading the repository…" })).toBeDisabled();
  });
});
