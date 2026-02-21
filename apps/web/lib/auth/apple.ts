import { createRemoteJWKSet, jwtVerify } from "jose";

const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

export interface AppleProfile {
  id: string;
  email: string;
  name?: string;
}

export async function verifyAppleToken(
  identityToken: string
): Promise<AppleProfile | null> {
  try {
    const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
      issuer: "https://appleid.apple.com",
      audience: process.env.APPLE_BUNDLE_ID,
    });

    if (!payload.sub) return null;

    return {
      id: payload.sub,
      email: (payload.email as string) || "",
      name: undefined,
    };
  } catch (err) {
    console.error("[Apple token verification failed]", err);
    return null;
  }
}
