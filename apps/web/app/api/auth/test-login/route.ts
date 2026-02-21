import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";

/**
 * Test-only login endpoint. Creates a session without Google OAuth.
 * Gated by TEST_LOGIN_KEY env var — disabled by default in all environments.
 */
export async function POST(request: Request) {
  const testKey = process.env.TEST_LOGIN_KEY;
  if (!testKey || process.env.NODE_ENV === "production") {
    return errors.notFound("Endpoint");
  }

  try {
    const body = await request.json();

    if (body.key !== testKey) {
      return errors.unauthorized();
    }

    const session = await getSession();

    session.id = body.id ?? "test-user-id";
    session.handle = body.handle ?? "testuser";
    session.firstName = body.firstName ?? "Test";
    session.lastName = body.lastName ?? "User";
    session.displayName = body.displayName ?? "Test User";
    session.email = body.email ?? "test@example.com";
    session.isLoggedIn = true;

    await session.save();

    return successResponse({ authenticated: true });
  } catch (err) {
    console.error("[POST /api/auth/test-login]", err);
    return errors.serverError("Failed to create test session");
  }
}
