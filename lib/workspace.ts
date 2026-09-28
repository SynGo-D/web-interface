/**
 * The organization and project the user is currently working in.
 *
 * Kept in browser storage next to the session: every page is scoped to a
 * project, and a reload shouldn't send someone back to the picker. It is
 * only a convenience — the server decides what this user may actually
 * see, from their membership and role.
 */

const STORAGE_KEY = "codelens_workspace";

export interface Workspace {
  organizationId: string;
  organizationName: string;
  role: "ADMIN" | "MANAGER" | "DEVELOPER";
  projectId: string;
  projectName: string;
}

/*
getWorkspace is read through useSyncExternalStore, which compares
snapshots by identity. Parsing the JSON on every call would return a new
object each time, so React would see an endless stream of changes and
loop ("The result of getSnapshot should be cached"). The parsed value is
cached and only replaced when the stored text itself changes.
*/
let cachedRaw: string | null = null;
let cachedWorkspace: Workspace | null = null;

const listeners = new Set<() => void>();

export function saveWorkspace(workspace: Workspace): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  notify();
}

export function getWorkspace(): Workspace | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === cachedRaw) {
    return cachedWorkspace;
  }

  cachedRaw = raw;
  cachedWorkspace = parse(raw);
  return cachedWorkspace;
}

export function clearWorkspace(): void {
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

/**
 * For useSyncExternalStore. Defined once at module level so its identity
 * is stable across renders, and listens for `storage` events too, so
 * switching project in one tab updates the others.
 */
export function subscribeToWorkspace(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** The server-side snapshot: browser storage doesn't exist while rendering there. */
export function noWorkspace(): null {
  return null;
}

function parse(raw: string | null): Workspace | null {
  if (!raw) return null;

  try {
    const stored = JSON.parse(raw) as Workspace;
    return stored.organizationId && stored.projectId ? stored : null;
  } catch {
    return null;
  }
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}
