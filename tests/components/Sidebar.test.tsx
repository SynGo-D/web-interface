import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Sidebar from "@/components/dashboard/Sidebar";
import { clearWorkspace, saveWorkspace } from "@/lib/workspace";

vi.mock("next/navigation", () => ({ usePathname: () => "/developer/dashboard" }));

beforeEach(() => {
  localStorage.clear();
  clearWorkspace();
});

describe("Sidebar", () => {
  it("renders the current project, organization and role", () => {
    saveWorkspace({
      organizationId: "org-1", organizationName: "Acme", role: "MANAGER",
      projectId: "project-1", projectName: "Checkout",
    });

    render(<Sidebar />);

    expect(screen.getByText("Checkout")).toBeInTheDocument();
    expect(screen.getByText(/Acme · manager/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Switch project" })).toBeInTheDocument();
  });

  it("invites the user to choose a project when none is set", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Choose a project" })).toBeInTheDocument();
  });

  it("links only to pages that exist, and marks the rest as coming soon", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: /Repositories/ })).toHaveAttribute("href", "/repository");
    expect(screen.getByRole("link", { name: /Pull Requests/ })).toHaveAttribute("href", "/developer/pull-requests");
    expect(screen.queryByRole("link", { name: /Debt Calculation/ })).not.toBeInTheDocument();
    expect(screen.getByText("Debt Calculation")).toBeInTheDocument();
  });
});
