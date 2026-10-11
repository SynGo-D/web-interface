import { getToken } from "./session";
import type { SuggestionJob, SuggestionReadyPullRequest } from "./aiTypes";

async function request(path: string, body?: unknown): Promise<unknown> {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: sign in to use AI Code Suggestion.");
  const response = await fetch(`/api/ai-suggestions/${path}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message ?? (response.status === 503 ? "AI service unavailable. Please retry." : "AI request failed."));
  return data;
}

export async function aiRequest(path: string, body?: unknown): Promise<{ job: SuggestionJob; duplicate?: boolean }> {
  const data = await request(path, body) as { job?: SuggestionJob; duplicate?: boolean };
  if (!data.job || typeof data.job.id !== "string" || !Array.isArray(data.job.suggestions) || !Array.isArray(data.job.findings)) {
    throw new Error("AI service returned an invalid response.");
  }
  return { job: data.job, ...(data.duplicate === undefined ? {} : { duplicate: data.duplicate }) };
}

export async function getSuggestionReadyPullRequests(owner: string, repository: string): Promise<SuggestionReadyPullRequest[]> {
  const data = await request(`repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/fixable-pull-requests`) as
    { pullRequests?: unknown };
  if (!Array.isArray(data.pullRequests) || data.pullRequests.some(pr => !pr || typeof pr !== "object" ||
    !Number.isSafeInteger((pr as SuggestionReadyPullRequest).number) || typeof (pr as SuggestionReadyPullRequest).headSha !== "string" ||
    typeof (pr as SuggestionReadyPullRequest).sourceBranch !== "string")) {
    throw new Error("AI service returned an invalid pull-request list.");
  }
  return data.pullRequests as SuggestionReadyPullRequest[];
}
export const activeSuggestionJob = (job: SuggestionJob | null) =>
  !!job && ["queued", "collecting", "generating_suggestion"].includes(job.status);
