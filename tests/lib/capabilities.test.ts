import { describe, expect, it } from "vitest";
import { CAPABILITIES, allows, type Capability } from "@/lib/capabilities";

/*
The table as the user manual publishes it. Written out again rather than
derived from CAPABILITIES, so that changing the table fails this test
instead of agreeing with itself.
*/
const MANUAL: Record<Capability, { ADMIN: boolean; MANAGER: boolean; DEVELOPER: boolean }> = {
  view: { ADMIN: true, MANAGER: true, DEVELOPER: true },
  rules: { ADMIN: true, MANAGER: false, DEVELOPER: true },
  debtAndFixes: { ADMIN: true, MANAGER: false, DEVELOPER: true },
  mergeFix: { ADMIN: true, MANAGER: false, DEVELOPER: true },
};

describe("capabilities", () => {
  it("matches the roles table in the user manual", () => {
    for (const capability of Object.keys(MANUAL) as Capability[]) {
      for (const role of ["ADMIN", "MANAGER", "DEVELOPER"] as const) {
        expect(
          allows(role, capability),
          `${role} / ${capability}`
        ).toBe(MANUAL[capability][role]);
      }
    }
  });

  it("gives a manager reading but not acting", () => {
    expect(allows("MANAGER", "view")).toBe(true);
    expect(allows("MANAGER", "rules")).toBe(false);
    expect(allows("MANAGER", "debtAndFixes")).toBe(false);
    expect(allows("MANAGER", "mergeFix")).toBe(false);
  });

  it("grants nothing without a role, rather than defaulting open", () => {
    for (const capability of Object.keys(CAPABILITIES) as Capability[]) {
      expect(allows(null, capability)).toBe(false);
      expect(allows(undefined, capability)).toBe(false);
    }
  });
});
