import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/forms/LoginForm";
import { ApiError } from "@/lib/api";
import { getUser } from "@/lib/session";
import { getWorkspace, saveWorkspace } from "@/lib/workspace";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const login = vi.fn();
vi.mock("@/lib/api", async () => ({
  ...(await vi.importActual<typeof import("@/lib/api")>("@/lib/api")),
  login: (...args: unknown[]) => login(...args),
}));

beforeEach(() => {
  localStorage.clear();
  push.mockClear();
  login.mockReset().mockResolvedValue({
    token: "token-1",
    user: { id: "user-1", email: "amara@acme.io", fullName: "Amara Perera" },
  });
});

async function signIn(email: string, password: string) {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.click(screen.getByRole("button", { name: "Sign In" }));
}

describe("LoginForm", () => {
  it("signs in with an organization email and password", async () => {
    render(<LoginForm />);

    await signIn("Amara@Acme.io", "correct horse battery");

    await waitFor(() => expect(push).toHaveBeenCalledWith("/select-project"));

    // Lower-cased, because that is how the address is stored — nobody
    // should be locked out by their keyboard's capital A.
    expect(login).toHaveBeenCalledWith("amara@acme.io", "correct horse battery");
    expect(getUser()).toEqual({ userId: "user-1", email: "amara@acme.io", fullName: "Amara Perera" });
  });

  it("shows the server's reason and stays put when the password is wrong", async () => {
    login.mockRejectedValue(new ApiError("Email or password is incorrect.", 401));

    render(<LoginForm />);
    await signIn("amara@acme.io", "guessing");

    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect.");
    expect(push).not.toHaveBeenCalled();
    expect(getUser()).toBeNull();
  });

  it("drops the previous person's project so it can't follow them in", async () => {
    saveWorkspace({
      organizationId: "org-9", organizationName: "Other Co", role: "ADMIN",
      projectId: "project-9", projectName: "Someone else's project",
    });

    render(<LoginForm />);
    await signIn("amara@acme.io", "correct horse battery");

    await waitFor(() => expect(getWorkspace()).toBeNull());
  });

  it("points people who were added by an admin at sign-up", () => {
    render(<LoginForm />);

    expect(screen.getByRole("link", { name: "Create your account" })).toHaveAttribute("href", "/signup");
  });
});
