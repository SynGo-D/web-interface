import { getToken } from "./session";
import type { FixablePullRequest, FixJob } from "./aiTypes";

async function request(path: string, body?: unknown): Promise<unknown> {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: sign in to use AI Code Fixing.");
  const response = await fetch(`/api/ai-suggestions/${path}`, {
    method: body === undefined ? "GET" : "POST", cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message ?? (response.status === 503 ? "AI service unavailable. Please retry." : "AI request failed."));
  return data;
}

export async function aiRequest(path: string, body?: unknown): Promise<{ job: FixJob; duplicate?: boolean }> {
  const data = await request(path, body) as { job?: FixJob; duplicate?: boolean };
  if (!data.job || typeof data.job.id !== "string" || !Array.isArray(data.job.suggestions) || !Array.isArray(data.job.findings)) {
    throw new Error("AI service returned an invalid response.");
  }
  return { job: data.job, ...(data.duplicate === undefined ? {} : { duplicate: data.duplicate }) };
}

export async function getFixablePullRequests(owner: string, repository: string): Promise<FixablePullRequest[]> {
  const data = await request(`repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/fixable-pull-requests`) as
    { pullRequests?: unknown };
  if (!Array.isArray(data.pullRequests) || data.pullRequests.some(pr => !pr || typeof pr !== "object" ||
    !Number.isSafeInteger((pr as FixablePullRequest).number) || typeof (pr as FixablePullRequest).headSha !== "string" ||
    typeof (pr as FixablePullRequest).sourceBranch !== "string")) {
    throw new Error("AI service returned an invalid pull-request list.");
  }
  return data.pullRequests as FixablePullRequest[];
}
export const activeJob = (job: FixJob | null) => !!job && ["queued", "collecting", "generating_suggestion", "validating", "creating_pull_request"].includes(job.status);
