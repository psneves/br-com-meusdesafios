import { getSession } from "./session";
import { verifyAccessToken } from "./mobile-token";

export interface AuthContext {
  userId: string;
  authType: "cookie" | "token";
}

/**
 * Extracts authentication context from either:
 * 1. Authorization: Bearer <accessToken> header (mobile)
 * 2. iron-session cookie (web)
 *
 * If a Bearer header is present but invalid, returns null immediately
 * (does NOT fall through to cookie auth).
 */
export async function getAuthContext(
  request?: Request
): Promise<AuthContext | null> {
  // 1. Try Bearer token first (if request provided)
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const userId = await verifyAccessToken(token);
      if (userId) {
        return { userId, authType: "token" };
      }
      // Invalid/expired token — don't fall through to cookie
      return null;
    }
  }

  // 2. Fall back to cookie-based session
  try {
    const session = await getSession();
    if (session.isLoggedIn && session.id) {
      return { userId: session.id, authType: "cookie" };
    }
  } catch {
    // getSession() can fail in non-cookie contexts
  }

  return null;
}
