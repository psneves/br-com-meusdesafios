import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import {
  getPendingRequests,
  getSuggestedUsers,
} from "@/lib/services/social.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const [pendingRequests, suggestedUsers] = await Promise.all([
      getPendingRequests(session.id),
      getSuggestedUsers(session.id),
    ]);

    return successResponse({ pendingRequests, suggestedUsers });
  } catch (err) {
    console.error("[GET /api/social/explore]", err);
    return errors.serverError();
  }
}
