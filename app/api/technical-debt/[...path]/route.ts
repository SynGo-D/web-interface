import { NextRequest, NextResponse } from "next/server";

// Proxies /api/technical-debt/<path> -> technical-debt-service /api/<path>,
// so the browser never calls the service directly (no CORS, one origin).
const TECH_DEBT_SERVICE_URL = (
  process.env.TECH_DEBT_SERVICE_URL ?? "http://localhost:5003"
).replace(/\/$/, "");

// Only the service's read + calculate endpoints are exposed.
const ALLOWED_PREFIXES = ["repositories/", "debt/"];

type Context = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const target = path.map(encodeURIComponent).join("/");

  if (!ALLOWED_PREFIXES.some((prefix) => target.startsWith(prefix))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const response = await fetch(
      `${TECH_DEBT_SERVICE_URL}/api/${target}${request.nextUrl.search}`,
      {
        method: request.method,
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Technical debt API error:", error);

    return NextResponse.json(
      { error: "Technical debt service is unavailable" },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
