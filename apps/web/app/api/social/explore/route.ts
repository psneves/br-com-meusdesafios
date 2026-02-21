import { getAuthContext } from "@/lib/auth/auth-context";
import { successResponse, errors } from "@/lib/api/response";
import {
  getPendingRequests,
  getSentPendingRequests,
  getSuggestedUsers,
} from "@/lib/services/social.service";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const [pendingRequests, sentRequests, suggestedUsers] = await Promise.all([
      getPendingRequests(auth.userId),
      getSentPendingRequests(auth.userId),
      getSuggestedUsers(auth.userId),
    ]);

    return successResponse({ pendingRequests, sentRequests, suggestedUsers });
  } catch (err) {
    console.error("[GET /api/social/explore]", err);
    return errors.serverError();
  }
}
