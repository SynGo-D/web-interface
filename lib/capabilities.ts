import type { OrganizationRole } from "@/lib/api";

/**
 * What each role may do, mirroring main-backend's requireCapability and
 * the user manual's roles table. The server is what enforces this; the
 * copy here exists so the interface does not offer a button the API will
 * refuse, which is a worse way to learn about a permission than not
 * seeing it at all.
 *
 * A table rather than a rank, because no single ordering fits: rules and
 * debt belong to developers and administrators, while merging an AI fix
 * belongs to administrators and managers. `can()` in lib/api.ts still
 * answers the two organization-level questions that are ordered by
 * seniority: projects and repositories need MANAGER, memberships ADMIN.
 */
export const CAPABILITIES = {
  /** Read analyses, contributors, debt and rules. */
  view: ["ADMIN", "MANAGER", "DEVELOPER"],
  /** Add, edit and remove business rules; rate an AI finding. */
  rules: ["ADMIN", "DEVELOPER"],
  /** Calculate technical debt. */
  debtAndFixes: ["ADMIN", "DEVELOPER"],
  /** Confirm that a validated fix pull request may be merged. */
  mergeFix: ["ADMIN", "DEVELOPER"],
  /**
   * Request, validate and publish AI fixes. ai-suggestions decides this
   * itself, not main-backend: any member of an organization that has the
   * repository connected.
   */
  aiFix: ["ADMIN", "MANAGER", "DEVELOPER"],
  /** Confirm an AI fix merge — ai-suggestions gives that to managers and administrators. */
  aiMerge: ["ADMIN", "MANAGER"],
} as const satisfies Record<string, readonly OrganizationRole[]>;

export type Capability = keyof typeof CAPABILITIES;

/**
 * Whether this role carries the capability. An unknown role carries
 * nothing: a signed-out or half-loaded session should read rather than
 * act, and the server would refuse it anyway.
 */
export function allows(
  role: OrganizationRole | null | undefined,
  capability: Capability
): boolean {
  const granted: readonly OrganizationRole[] = CAPABILITIES[capability];
  return role ? granted.includes(role) : false;
}

/** Why the action is missing, for the one line shown in its place. */
export const WITHHELD: Record<Capability, string> = {
  view: "Only members of this organization can see this repository.",
  rules: "Business rules and AI feedback are for developers and administrators.",
  debtAndFixes: "Calculating debt is for developers and administrators.",
  mergeFix: "Confirming a fix merge is for developers and administrators.",
  aiFix: "Only members of this organization can request AI fixes.",
  aiMerge: "A project manager or administrator must approve merging this fix.",
};
