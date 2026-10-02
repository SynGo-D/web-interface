import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RepositoryPage from "@/app/repository/page";
import { saveSession } from "@/lib/session";
import { clearWorkspace, saveWorkspace } from "@/lib/workspace";

const back = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back, push }),
  usePathname: () => "/repository",
}));

vi.mock("@/lib/api", async () => ({
  ...(await vi.importActual<typeof import("@/lib/api")>("@/lib/api")),
  listIntegrations: () => Promise.resolve([]),
}));

/* history.length is read directly, so each test sets the case it is about. */
function historyLength(value: number) {
  Object.defineProperty(window.history, "length", { value, configurable: true });
}

beforeEach(() => {
  localStorage.clear();
  clearWorkspace();
  vi.clearAllMocks();
  saveSession("token", { userId: "u1", email: "a@b.c", fullName: "A B" });
  saveWorkspace({
    organizationId: "org-1", organizationName: "Acme", role: "DEVELOPER",
    projectId: "project-1", projectName: "Shop",
  });
});

describe("Repositories page back button", () => {
  it("goes back to wherever the user came from", async () => {
    historyLength(3);
    const user = userEvent.setup();

    render(<RepositoryPage />);
    await user.click(screen.getByRole("button", { name: /Back/ }));

    expect(back).toHaveBeenCalledOnce();
    expect(push).not.toHaveBeenCalled();
  });

  it("goes to the dashboard when there is nowhere to go back to", async () => {
    // A new tab, a bookmark, or the first page after signing in. router.back()
    // would do nothing here, leaving a button that looks live and is not.
    historyLength(1);
    const user = userEvent.setup();

    render(<RepositoryPage />);
    await user.click(screen.getByRole("button", { name: /Back/ }));

    expect(push).toHaveBeenCalledWith("/developer/dashboard");
    expect(back).not.toHaveBeenCalled();
  });

  it("is a button rather than a link, since its destination is not a URL", async () => {
    historyLength(2);

    render(<RepositoryPage />);

    expect(screen.getByRole("button", { name: /Back/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Back/ })).not.toBeInTheDocument();
  });
});
