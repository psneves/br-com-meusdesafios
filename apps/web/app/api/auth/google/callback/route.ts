import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, verifyGoogleToken } from "@/lib/auth/oauth";
import { findOrCreateGoogleUser } from "@/lib/auth/user";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state") || "/today";

    if (!code) {
      return NextResponse.redirect(
        new URL("/login?error=oauth_cancelled", request.url).toString()
      );
    }

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/google/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    if (!tokens.id_token) {
      throw new Error("No ID token received from Google");
    }

    const profile = await verifyGoogleToken(tokens.id_token);
    if (!profile) {
      throw new Error("Invalid Google token");
    }

    const user = await findOrCreateGoogleUser(profile);

    const session = await getSession();
    session.id = user.id;
    session.handle = user.handle;
    session.firstName = user.firstName;
    session.lastName = user.lastName;
    session.displayName = user.displayName;
    session.email = user.email;
    // avatarUrl is read from DB by /api/auth/me (too large for cookie when base64)
    session.isLoggedIn = true;
    session.provider = "google";
    await session.save();

    return NextResponse.redirect(new URL(state, request.url).toString());
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=oauth_error", request.url).toString()
    );
  }
}
