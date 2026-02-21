import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { getAcceptedFriends } from "@/lib/services/social.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const friends = await getAcceptedFriends(session.id);
    return successResponse({ friends });
  } catch (err) {
    console.error("[GET /api/social/friends]", err);
    return errors.serverError();
  }
}
