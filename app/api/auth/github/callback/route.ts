import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code not found." },
      { status: 400 }
    );
  }

  const response = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const data = await response.json();

  if (data.error) {
    return NextResponse.json(
      { error: data.error_description },
      { status: 400 }
    );
  }

  // Access token returned by GitHub
  const accessToken = data.access_token;

  console.log("GitHub Access Token:", accessToken);

  // TODO:
  // Save the access token securely (database/session)

  return NextResponse.redirect(
    new URL("/authorization-success", request.url)
  );
}