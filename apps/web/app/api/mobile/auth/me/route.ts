import { getAuthContext } from "@/lib/auth/auth-context";
import { successResponse, errors } from "@/lib/api/response";
import { getProfile } from "@/lib/services/user.service";
import { getFriendCount } from "@/lib/services/social.service";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const [profile, friendCountResult] = await Promise.all([
      getProfile(auth.userId).catch(() => null),
      getFriendCount(auth.userId).catch(() => ({ friendsCount: 0 })),
    ]);

    if (!profile) return errors.notFound("User");

    return successResponse({
      id: auth.userId,
      handle: profile.handle || "",
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      displayName: profile.displayName || "",
      avatarUrl: profile.avatarUrl ?? null,
      friendsCount: friendCountResult.friendsCount,
    });
  } catch (err) {
    console.error("[GET /api/mobile/auth/me]", err);
    return errors.serverError();
  }
}
