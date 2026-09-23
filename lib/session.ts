const STORAGE_KEY = "codelens_session";

export interface StoredUser {
  userId: string;
  email: string;
  fullName: string;
}

interface StoredSession {
  token: string;
  user: StoredUser;
}

const listeners = new Set<() => void>();

export function saveSession(token: string, user: StoredUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  notify();
}

/**
 * For useSyncExternalStore. Defined once at module level so its identity
 * is stable across renders, which keeps React from resubscribing on every
 * render, and follows `storage` events so signing out in one tab reaches
 * the others.
 */
export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/**
 * A boolean, not the user object: snapshots are compared by identity, and
 * getUser() parses fresh JSON on each call, which would loop forever.
 */
export function isSignedIn(): boolean {
  return getSession() !== null;
}

/** The server-side snapshot: browser storage doesn't exist while rendering there. */
export function signedInUnknown(): null {
  return null;
}

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function getUser(): StoredUser | null {
  return getSession()?.user ?? null;
}

export function getToken(): string | null {
  return getSession()?.token ?? null;
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
  notify();
}

function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}
