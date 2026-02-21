import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";
import { getDataSource, MobileAuthSession, IsNull } from "@meusdesafios/db";

const JWT_SECRET_RAW = process.env.MOBILE_JWT_SECRET || "";
const ACCESS_TTL_MIN = Number(process.env.MOBILE_ACCESS_TOKEN_TTL_MIN) || 15;
const REFRESH_TTL_DAYS = Number(process.env.MOBILE_REFRESH_TOKEN_TTL_DAYS) || 30;

const FALLBACK_SECRET = "dev_mobile_jwt_secret_32_chars__";
const secretString =
  JWT_SECRET_RAW.length >= 32 ? JWT_SECRET_RAW : FALLBACK_SECRET;

if (secretString === FALLBACK_SECRET && process.env.NODE_ENV !== "production") {
  console.warn(
    "[meusdesafios] Using fallback mobile JWT secret. Set MOBILE_JWT_SECRET for stronger security."
  );
}

const JWT_SECRET = new TextEncoder().encode(secretString);

function ensureSecret(): void {
  if (secretString === FALLBACK_SECRET && process.env.NODE_ENV === "production") {
    throw new Error(
      "MOBILE_JWT_SECRET is not set or too short. Set a >= 32 char random string in production."
    );
  }
}

// --- Access Token ---

export async function createAccessToken(userId: string): Promise<string> {
  ensureSecret();
  return new SignJWT({ type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_MIN}m`)
    .setIssuer("meusdesafios")
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(
  token: string
): Promise<string | null> {
  ensureSecret();
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "meusdesafios",
    });
    if (payload.type !== "access" || !payload.sub) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

// --- Refresh Token ---

export function generateRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueTokenPair(
  userId: string,
  deviceId: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const accessToken = await createAccessToken(userId);
  const refreshToken = generateRefreshToken();
  await createRefreshSession(userId, deviceId, refreshToken);
  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TTL_MIN * 60,
  };
}

async function createRefreshSession(
  userId: string,
  deviceId: string,
  refreshToken: string
): Promise<void> {
  const ds = await getDataSource();
  const repo = ds.getRepository(MobileAuthSession);

  // Revoke any existing active sessions for this user+device
  await repo.update(
    { userId, deviceId, revokedAt: IsNull() },
    { revokedAt: new Date() }
  );

  const session = repo.create({
    userId,
    deviceId,
    refreshTokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
    lastUsedAt: new Date(),
  });
  await repo.save(session);
}

export async function rotateRefreshToken(
  oldRefreshToken: string
): Promise<{
  userId: string;
  deviceId: string;
  newRefreshToken: string;
} | null> {
  const ds = await getDataSource();
  const repo = ds.getRepository(MobileAuthSession);

  const oldHash = hashRefreshToken(oldRefreshToken);
  const session = await repo.findOne({
    where: { refreshTokenHash: oldHash },
  });

  if (!session) return null;

  // Replay detection: if already revoked, revoke all sessions for this user+device
  if (session.revokedAt) {
    await repo.update(
      { userId: session.userId, deviceId: session.deviceId, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );
    return null;
  }

  // Check expiry
  if (session.expiresAt < new Date()) {
    session.revokedAt = new Date();
    await repo.save(session);
    return null;
  }

  // Revoke old token
  session.revokedAt = new Date();
  session.lastUsedAt = new Date();
  await repo.save(session);

  // Issue new refresh token
  const newRefreshToken = generateRefreshToken();
  const newSession = repo.create({
    userId: session.userId,
    deviceId: session.deviceId,
    refreshTokenHash: hashRefreshToken(newRefreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
    lastUsedAt: new Date(),
  });
  await repo.save(newSession);

  return {
    userId: session.userId,
    deviceId: session.deviceId,
    newRefreshToken,
  };
}

export async function revokeRefreshToken(
  refreshToken: string
): Promise<boolean> {
  const ds = await getDataSource();
  const repo = ds.getRepository(MobileAuthSession);
  const hash = hashRefreshToken(refreshToken);
  const result = await repo.update(
    { refreshTokenHash: hash, revokedAt: IsNull() },
    { revokedAt: new Date() }
  );
  return (result.affected ?? 0) > 0;
}
