import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/auth/oauth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectTo = searchParams.get("redirectTo") || "/today";

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/google/callback`;
    const authUrl = getGoogleAuthUrl(redirectUri);

    const url = new URL(authUrl);
    url.searchParams.set("state", redirectTo);

    return NextResponse.redirect(url.toString());
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    return NextResponse.redirect(
      new URL("/login?error=oauth_error", request.url).toString()
    );
  }
}
