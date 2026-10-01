import { getToken } from "./session";
import type { FixJob } from "./aiTypes";

export async function aiRequest(path: string, body?: unknown): Promise<{ job: FixJob; duplicate?: boolean }> {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: sign in to use AI Code Fixing.");
  const response = await fetch(`/api/ai-suggestions/${path}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message ?? (response.status === 503 ? "AI service unavailable. Please retry." : "AI request failed."));
  if (!data.job || typeof data.job.id !== "string" || !Array.isArray(data.job.suggestions) || !Array.isArray(data.job.findings)) {
    throw new Error("AI service returned an invalid response.");
  }
  return data;
}
export const activeJob = (job: FixJob | null) => !!job && ["queued", "collecting", "generating_suggestion", "validating", "creating_pull_request"].includes(job.status);
