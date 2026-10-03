import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpPage from "@/app/signup/page";
import { ApiError } from "@/lib/api";
import { getUser } from "@/lib/session";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const register = vi.fn();
vi.mock("@/lib/api", async () => ({
  ...(await vi.importActual<typeof import("@/lib/api")>("@/lib/api")),
  register: (...args: unknown[]) => register(...args),
}));

beforeEach(() => {
  localStorage.clear();
  push.mockClear();
  register.mockReset().mockResolvedValue({
    token: "token-1",
    user: { id: "user-1", email: "amara@acme.io", fullName: "Amara Perera" },
  });
});

async function fillIn({ password, confirmation }: { password: string; confirmation: string }) {
  await userEvent.type(screen.getByLabelText("Full name"), "Amara Perera");
  await userEvent.type(screen.getByLabelText("Organization email"), "amara@acme.io");
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.type(screen.getByLabelText("Confirm password"), confirmation);
  await userEvent.click(screen.getByRole("button", { name: "Create account" }));
}

describe("Sign up", () => {
  it("creates the account and signs the person straight in", async () => {
    render(<SignUpPage />);

    await fillIn({ password: "a good password", confirmation: "a good password" });

    await waitFor(() => expect(push).toHaveBeenCalledWith("/select-project"));
    expect(register).toHaveBeenCalledWith("amara@acme.io", "Amara Perera", "a good password");
    expect(getUser()).toMatchObject({ userId: "user-1" });
  });

  it("catches a mistyped confirmation before asking the server", async () => {
    render(<SignUpPage />);

    await fillIn({ password: "a good password", confirmation: "a food password" });

    expect(await screen.findByRole("alert")).toHaveTextContent("don't match");
    expect(register).not.toHaveBeenCalled();
  });

  it("refuses a password shorter than the server would accept", async () => {
    render(<SignUpPage />);

    await fillIn({ password: "short", confirmation: "short" });

    expect(await screen.findByRole("alert")).toHaveTextContent("at least 8 characters");
    expect(register).not.toHaveBeenCalled();
  });

  it("reports an email that is already registered", async () => {
    register.mockRejectedValue(
      new ApiError("An account with this email already exists. Sign in instead.", 409)
    );

    render(<SignUpPage />);
    await fillIn({ password: "a good password", confirmation: "a good password" });

    expect(await screen.findByRole("alert")).toHaveTextContent("already exists");
    expect(push).not.toHaveBeenCalled();
  });
});
