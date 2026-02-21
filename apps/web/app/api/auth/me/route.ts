import { getAuthContext } from "@/lib/auth/auth-context";
import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { getProfile } from "@/lib/services/user.service";
import { getFriendCount } from "@/lib/services/social.service";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    // Fetch fresh profile from DB to get up-to-date avatarUrl
    // (base64 data URIs are too large for session cookies)
    // Catch individually so a single DB failure doesn't break the whole response
    const [profile, friendCountResult] = await Promise.all([
      getProfile(auth.userId).catch(() => null),
      getFriendCount(auth.userId).catch(() => ({ friendsCount: 0 })),
    ]);

    // For cookie auth, use session fields as fallback; for token auth, use DB only
    let handle = profile?.handle || "";
    let firstName = profile?.firstName || "";
    let lastName = profile?.lastName || "";
    let displayName = profile?.displayName || "";

    if (auth.authType === "cookie") {
      const session = await getSession();
      handle = handle || session.handle || "";
      firstName = firstName || session.firstName || "";
      lastName = lastName || session.lastName || "";
      displayName = displayName || session.displayName || "";
    }

    return successResponse({
      id: auth.userId,
      handle,
      firstName,
      lastName,
      displayName,
      avatarUrl: profile?.avatarUrl ?? null,
      friendsCount: friendCountResult.friendsCount,
    });
  } catch (err) {
    console.error("[GET /api/auth/me]", err);
    return errors.serverError();
  }
}
