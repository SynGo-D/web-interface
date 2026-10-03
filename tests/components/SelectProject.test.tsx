import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectProjectPage from "@/app/select-project/page";
import { saveSession } from "@/lib/session";
import { getWorkspace } from "@/lib/workspace";
import type { Project, ProjectRepositoryRef } from "@/lib/api";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const listOrganizations = vi.fn();
const listProjects = vi.fn();
vi.mock("@/lib/api", async () => ({
  ...(await vi.importActual<typeof import("@/lib/api")>("@/lib/api")),
  listOrganizations: () => listOrganizations(),
  listProjects: (organizationId: string) => listProjects(organizationId),
}));

function repository(overrides: Partial<ProjectRepositoryRef> = {}): ProjectRepositoryRef {
  return {
    integrationId: "integration-1",
    provider: "github",
    repositoryOwner: "acme",
    repositoryName: "web",
    status: "ACTIVE",
    ...overrides,
  };
}

function project(name: string, repositories: ProjectRepositoryRef[]): Project {
  return {
    id: `project-${name}`,
    organizationId: "org-1",
    name,
    slug: name.toLowerCase(),
    description: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    repositories,
  };
}

function signedInAs(role: "ADMIN" | "MANAGER" | "DEVELOPER") {
  saveSession("token-1", { userId: "user-1", email: "amara@acme.io", fullName: "Amara" });
  listOrganizations.mockResolvedValue([
    { organization: { id: "org-1", name: "Acme", slug: "acme", createdAt: "", updatedAt: "" }, role },
  ]);
}

beforeEach(() => {
  localStorage.clear();
  push.mockClear();
  listOrganizations.mockReset();
  listProjects.mockReset();
});

describe("Choose a project", () => {
  it("opens the dashboard of a project that has a connected repository", async () => {
    signedInAs("MANAGER");
    listProjects.mockResolvedValue([project("Checkout", [repository()])]);

    render(<SelectProjectPage />);
    await userEvent.click(await screen.findByRole("button", { name: /Checkout/ }));

    expect(push).toHaveBeenCalledWith("/developer/dashboard");
    expect(getWorkspace()).toMatchObject({
      organizationId: "org-1", projectId: "project-Checkout", projectName: "Checkout", role: "MANAGER",
    });
  });

  it("sends a project with no repository to the connect page", async () => {
    signedInAs("MANAGER");
    listProjects.mockResolvedValue([project("Billing", [])]);

    render(<SelectProjectPage />);
    await userEvent.click(await screen.findByRole("button", { name: /Billing/ }));

    expect(push).toHaveBeenCalledWith("/projects/connect-repository");
  });

  it("treats a repository that was never authorized as no repository", async () => {
    signedInAs("MANAGER");
    listProjects.mockResolvedValue([project("Billing", [repository({ status: "PENDING" })])]);

    render(<SelectProjectPage />);
    await userEvent.click(await screen.findByRole("button", { name: /Billing/ }));

    expect(push).toHaveBeenCalledWith("/projects/connect-repository");
  });

  it("offers project creation on its own page, to managers and admins", async () => {
    signedInAs("MANAGER");
    listProjects.mockResolvedValue([project("Checkout", [repository()])]);

    render(<SelectProjectPage />);

    expect(await screen.findByRole("link", { name: "Create a project" })).toHaveAttribute(
      "href",
      "/projects/new?organizationId=org-1"
    );
  });

  it("hides project creation from developers", async () => {
    signedInAs("DEVELOPER");
    listProjects.mockResolvedValue([project("Checkout", [repository()])]);

    render(<SelectProjectPage />);
    await screen.findByRole("button", { name: /Checkout/ });

    expect(screen.queryByRole("link", { name: "Create a project" })).not.toBeInTheDocument();
  });

  it("says what an empty project still needs", async () => {
    signedInAs("MANAGER");
    listProjects.mockResolvedValue([project("Billing", [])]);

    render(<SelectProjectPage />);

    await waitFor(() => expect(screen.getByText(/No repository yet/)).toBeInTheDocument());
  });
});
