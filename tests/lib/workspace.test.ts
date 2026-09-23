import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearWorkspace, getWorkspace, saveWorkspace, subscribeToWorkspace, type Workspace } from "@/lib/workspace";
import { isSignedIn, saveSession, clearUser, subscribeToSession } from "@/lib/session";

const WORKSPACE: Workspace = {
  organizationId: "org-1",
  organizationName: "Acme",
  role: "MANAGER",
  projectId: "project-1",
  projectName: "Checkout",
};

beforeEach(() => {
  localStorage.clear();
  clearWorkspace();
});

describe("workspace storage", () => {
  it("returns the same object until the stored value changes", () => {
    // The bug this guards: getWorkspace parsed fresh JSON on every call,
    // so useSyncExternalStore saw a new snapshot each render and looped
    // ("The result of getSnapshot should be cached").
    saveWorkspace(WORKSPACE);

    const first = getWorkspace();
    const second = getWorkspace();

    expect(first).toBe(second);
    expect(first?.projectName).toBe("Checkout");
  });

  it("returns a new object after the workspace changes", () => {
    saveWorkspace(WORKSPACE);
    const before = getWorkspace();

    saveWorkspace({ ...WORKSPACE, projectId: "project-2", projectName: "Billing" });

    expect(getWorkspace()).not.toBe(before);
    expect(getWorkspace()?.projectName).toBe("Billing");
  });

  it("is null before a project is chosen, and again after clearing", () => {
    expect(getWorkspace()).toBeNull();

    saveWorkspace(WORKSPACE);
    expect(getWorkspace()).not.toBeNull();

    clearWorkspace();
    expect(getWorkspace()).toBeNull();
  });

  it("ignores stored text that isn't a usable workspace", () => {
    localStorage.setItem("codelens_workspace", "{not json");
    expect(getWorkspace()).toBeNull();

    localStorage.setItem("codelens_workspace", JSON.stringify({ organizationId: "org-1" }));
    expect(getWorkspace()).toBeNull();
  });

  it("tells subscribers when the project changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToWorkspace(listener);

    saveWorkspace(WORKSPACE);
    clearWorkspace();
    unsubscribe();
    saveWorkspace(WORKSPACE);

    expect(listener).toHaveBeenCalledTimes(2);
  });
});

describe("session snapshot", () => {
  it("is a boolean, so repeated reads are equal", () => {
    saveSession("token", { userId: "u1", email: "a@b.test", fullName: "A" });

    expect(isSignedIn()).toBe(true);
    expect(isSignedIn()).toBe(isSignedIn());

    clearUser();
    expect(isSignedIn()).toBe(false);
  });

  it("tells subscribers about signing in and out", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToSession(listener);

    saveSession("token", { userId: "u1", email: "a@b.test", fullName: "A" });
    clearUser();
    unsubscribe();

    expect(listener).toHaveBeenCalledTimes(2);
  });
});
