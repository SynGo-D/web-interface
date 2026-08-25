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

export function saveSession(token: string, user: StoredUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

export function getUser(): StoredUser | null {
  return getSession()?.user ?? null;
}

export function getToken(): string | null {
  return getSession()?.token ?? null;
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
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
