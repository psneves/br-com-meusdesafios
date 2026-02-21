import { randomUUID } from "node:crypto";
import { getDataSource, User } from "@meusdesafios/db";
import { successResponse, errors } from "@/lib/api/response";
import { getSession } from "@/lib/auth/session";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toStringOrUndefined(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeHandle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 45);
}

async function upsertTestUser(body: Record<string, unknown>): Promise<User> {
  const ds = await getDataSource();
  const userRepo = ds.getRepository(User);

  const requestedId = toStringOrUndefined(body.id);
  const userId =
    requestedId && UUID_PATTERN.test(requestedId) ? requestedId : randomUUID();
  const email = (
    toStringOrUndefined(body.email) ?? "test@example.com"
  ).toLowerCase();
  const firstName = toStringOrUndefined(body.firstName) ?? "Test";
  const lastName = toStringOrUndefined(body.lastName) ?? "User";
  const displayName = toStringOrUndefined(body.displayName) ?? "Test User";
  const avatarUrl = toStringOrUndefined(body.avatarUrl) ?? null;

  const baseHandle =
    normalizeHandle(
      toStringOrUndefined(body.handle) ?? email.split("@")[0] ?? "testuser"
    ) || "testuser";

  let user = await userRepo.findOne({
    where: [{ id: userId }, { email }],
  });

  if (!user) {
    let handle = baseHandle;
    const existingHandle = await userRepo.findOneBy({ handle });
    if (existingHandle && existingHandle.email !== email) {
      const suffix = Math.floor(Math.random() * 9000 + 1000);
      handle = `${handle.slice(0, 40)}_${suffix}`;
    }

    user = userRepo.create({
      id: userId,
      handle,
      firstName,
      lastName,
      displayName,
      email,
      provider: "google",
      googleId: null,
      passwordHash: null,
      avatarUrl,
      isActive: true,
      lastLoginAt: new Date(),
    });
  } else {
    user.firstName = firstName;
    user.lastName = lastName;
    user.displayName = displayName;
    user.avatarUrl = avatarUrl;
    user.lastLoginAt = new Date();
    user.provider = user.provider ?? "google";
  }

  return userRepo.save(user);
}

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
    const bodyJson: unknown = await request.json();
    if (!isRecord(bodyJson)) {
      return errors.badRequest("Invalid request body");
    }

    if (bodyJson.key !== testKey) {
      return errors.unauthorized();
    }

    const user = await upsertTestUser(bodyJson);

    const session = await getSession();

    session.id = user.id;
    session.handle = user.handle;
    session.firstName = user.firstName;
    session.lastName = user.lastName;
    session.displayName = user.displayName;
    session.email = user.email;
    session.provider = "google";
    session.isLoggedIn = true;

    await session.save();

    return successResponse({ authenticated: true });
  } catch (err) {
    console.error("[POST /api/auth/test-login]", err);
    return errors.serverError("Failed to create test session");
  }
}
