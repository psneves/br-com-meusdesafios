import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { getProfile } from "@/lib/services/user.service";
import { getFriendCount } from "@/lib/services/social.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    // Fetch fresh profile from DB to get up-to-date avatarUrl
    // (base64 data URIs are too large for session cookies)
    const [profile, friendCountResult] = await Promise.all([
      getProfile(session.id),
      getFriendCount(session.id),
    ]);

    return successResponse({
      id: session.id,
      handle: profile?.handle ?? session.handle ?? "",
      firstName: profile?.firstName ?? session.firstName ?? "",
      lastName: profile?.lastName ?? session.lastName ?? "",
      displayName: profile?.displayName ?? session.displayName,
      avatarUrl: profile?.avatarUrl ?? null,
      friendsCount: friendCountResult.friendsCount,
    });
  } catch (err) {
    console.error("[GET /api/auth/me]", err);
    return errors.serverError();
  }
}
