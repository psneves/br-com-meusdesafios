import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

/**
 * Test-only login endpoint. Creates a session without Google OAuth.
 * Only available in development/test environments.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const session = await getSession();

    session.id = body.id ?? "test-user-id";
    session.handle = body.handle ?? "testuser";
    session.firstName = body.firstName ?? "Test";
    session.lastName = body.lastName ?? "User";
    session.displayName = body.displayName ?? "Test User";
    session.email = body.email ?? "test@example.com";
    // avatarUrl is read from DB by /api/auth/me (too large for cookie when base64)
    session.isLoggedIn = true;

    await session.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/auth/test-login]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
