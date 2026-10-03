import { NextResponse } from "next/server";

async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const route = path.join("/");
  if (!/^jobs(?:\/[a-f0-9]{64}(?:\/(validate|publish|retry|merge))?)?$/.test(route)) {
    return NextResponse.json({ error: { message: "Unknown AI endpoint." } }, { status: 404 });
  }
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return NextResponse.json({ error: { message: "Unauthorized: sign in first." } }, { status: 401 });
  const service = process.env.AI_SUGGESTIONS_URL;
  const token = process.env.INTERNAL_SERVICE_TOKEN;
  if (!service || service.includes("<") || !token || token.includes("<")) return NextResponse.json({ error: { message: "AI service unavailable: configuration is incomplete." } }, { status: 503 });
  try {
    const body = request.method === "POST" ? await request.text() : undefined;
    if (body && Buffer.byteLength(body) > 32_000) return NextResponse.json({ error: { message: "Request too large." } }, { status: 413 });
    const response = await fetch(`${service.replace(/\/$/, "")}/${route}`, {
      method: request.method, body, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(55_000),
      headers: { Authorization: authorization, "X-Internal-Token": token, "Content-Type": "application/json" },
    });
    return NextResponse.json(await response.json(), { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: { message: "AI service unavailable. Existing analysis remains available." } }, { status: 503 });
  }
}
export const GET = proxy;
export const POST = proxy;
