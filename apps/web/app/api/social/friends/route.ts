import { getAuthContext } from "@/lib/auth/auth-context";
import { successResponse, errors } from "@/lib/api/response";
import { getAcceptedFriends } from "@/lib/services/social.service";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const friends = await getAcceptedFriends(auth.userId);
    return successResponse({ friends });
  } catch (err) {
    console.error("[GET /api/social/friends]", err);
    return errors.serverError();
  }
}
