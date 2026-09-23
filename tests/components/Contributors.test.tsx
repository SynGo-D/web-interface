import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ContributorsPage from "@/app/developer/contributors/page";
import { saveSession } from "@/lib/session";
import { saveWorkspace } from "@/lib/workspace";
import type { Contributor, Integration } from "@/lib/api";

vi.mock("next/navigation", () => ({ usePathname: () => "/developer/contributors" }));

const listIntegrations = vi.fn();
const getContributors = vi.fn();
vi.mock("@/lib/api", async () => ({
  ...(await vi.importActual<typeof import("@/lib/api")>("@/lib/api")),
  listIntegrations: () => listIntegrations(),
  getContributors: (owner: string, repo: string) => getContributors(owner, repo),
}));

function integration(): Integration {
  return {
    id: "i1", userId: "u1", provider: "github",
    repositoryUrl: "https://github.com/acme/shop",
    repositoryOwner: "acme", repositoryName: "shop",
    status: "ACTIVE", webhookRegistered: true,
    createdAt: "", updatedAt: "",
  };
}

function contributor(overrides: Partial<Contributor> = {}): Contributor {
  return {
    username: "amara",
    provider_user_id: "77",
    pull_requests: 3,
    analyses: 7,
    files_changed: 12,
    lines_added: 430,
    lines_removed: 120,
    issues: 9,
    errors: 2,
    warnings: 7,
    review_findings: { high: 1, medium: 2, low: 1 },
    debt: { score: null, status: "pending", introduced_at: null },
    last_analysis_at: "2026-09-23T10:00:00.000Z",
    ...overrides,
  };
}

function signedIn() {
  saveSession("t", { userId: "u1", email: "a@b.io", fullName: "Amara" });
  saveWorkspace({
    organizationId: "org-1", organizationName: "Acme", role: "MANAGER",
    projectId: "p-1", projectName: "Shop",
  });
}

beforeEach(() => {
  localStorage.clear();
  listIntegrations.mockReset().mockResolvedValue([integration()]);
  getContributors.mockReset().mockResolvedValue({
    repository: "acme/shop", contributors: [contributor()], debt_source: "pending",
  });
});

describe("Contributors page", () => {
  it("shows each contributor's work", async () => {
    signedIn();
    render(<ContributorsPage />);

    // Scoped to the card: figures like "3" appear elsewhere on the page,
    // and the claim being tested is about this contributor.
    const row = (await screen.findByText("amara")).closest("article")!;

    expect(within(row).getByText("3")).toBeInTheDocument();       // pull requests
    expect(within(row).getByText("+430")).toBeInTheDocument();
    expect(within(row).getByText("−120")).toBeInTheDocument();
    expect(within(row).getByText(/2 errors, 7 warnings/)).toBeInTheDocument();
    expect(within(row).getByText(/7 analyses/)).toBeInTheDocument();
    expect(within(row).getByText("4")).toBeInTheDocument();        // review findings
    // "1 high" is its own span so it can be coloured, so the breakdown
    // is checked on the paragraph's text rather than as one element.
    expect(within(row).getByText("1 high")).toBeInTheDocument();
    expect(row.textContent).toContain("2 medium");
    expect(row.textContent).toContain("1 low");
  });

  it("shows debt as pending rather than as a zero", async () => {
    // A blank or a 0 under "Debt introduced" would read as "no debt",
    // which is a different claim from "nothing has measured this yet".
    signedIn();
    render(<ContributorsPage />);

    expect(await screen.findByText("Pending")).toBeInTheDocument();
    expect(screen.queryByText("0", { selector: "td span" })).not.toBeInTheDocument();
  });

  it("shows a real debt score once the service reports one", async () => {
    getContributors.mockResolvedValue({
      repository: "acme/shop",
      contributors: [contributor({
        debt: { score: 1250, status: "available", introduced_at: "2026-09-23T10:00:00.000Z" },
      })],
      debt_source: "available",
    });
    signedIn();

    render(<ContributorsPage />);

    expect(await screen.findByText("1,250")).toBeInTheDocument();
    expect(screen.queryByText("Pending")).not.toBeInTheDocument();
  });

  it("shows the contributor's avatar, derived from their account id", async () => {
    signedIn();
    render(<ContributorsPage />);

    const avatar = (await screen.findByText("amara")).closest("article")!.querySelector("img");

    // next/image rewrites the src through its optimizer, so the assertion
    // is that the upstream URL it was given is the derived one.
    expect(avatar).not.toBeNull();
    expect(decodeURIComponent(avatar!.getAttribute("src") ?? "")).toContain(
      "https://avatars.githubusercontent.com/u/77"
    );
  });

  it("falls back to an initial when there is no account id to derive from", async () => {
    // A deleted account, or a provider whose avatar URL cannot be built
    // from an id alone.
    getContributors.mockResolvedValue({
      repository: "acme/shop",
      contributors: [contributor({ provider_user_id: null })],
      debt_source: "pending",
    });
    signedIn();

    render(<ContributorsPage />);

    const card = (await screen.findByText("amara")).closest("article")!;
    expect(card.querySelector("img")).toBeNull();
    expect(within(card).getByText("A")).toBeInTheDocument();
  });

  it("explains an empty repository rather than showing a blank table", async () => {
    getContributors.mockResolvedValue({ repository: "acme/shop", contributors: [], debt_source: "pending" });
    signedIn();

    render(<ContributorsPage />);

    expect(await screen.findByText(/No analysed pull requests/)).toBeInTheDocument();
  });

  it("asks for a project when none is chosen", async () => {
    saveSession("t", { userId: "u1", email: "a@b.io", fullName: "Amara" });

    render(<ContributorsPage />);

    // The sidebar offers its own "Choose a project" link when none is
    // set, so this looks in the page body rather than the whole document.
    expect(
      await screen.findByText("Choose a project to see its contributors.")
    ).toBeInTheDocument();
  });
});
