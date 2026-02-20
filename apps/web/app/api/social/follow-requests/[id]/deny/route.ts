import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { denyFollowRequest } from "@/lib/services/social.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const { id } = await params;
    await denyFollowRequest(session.id, id);
    return successResponse({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Follow request not found") {
      return errors.notFound("Follow request");
    }
    console.error("[POST /api/social/follow-requests/:id/deny]", err);
    return errors.serverError();
  }
}
