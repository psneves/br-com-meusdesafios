import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import {
  getPendingRequests,
  getSentPendingRequests,
  getSuggestedUsers,
} from "@/lib/services/social.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const [pendingRequests, sentRequests, suggestedUsers] = await Promise.all([
      getPendingRequests(session.id),
      getSentPendingRequests(session.id),
      getSuggestedUsers(session.id),
    ]);

    return successResponse({ pendingRequests, sentRequests, suggestedUsers });
  } catch (err) {
    console.error("[GET /api/social/explore]", err);
    return errors.serverError();
  }
}
