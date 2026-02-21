import { getAuthContext } from "@/lib/auth/auth-context";
import { successResponse, errors } from "@/lib/api/response";
import { acceptFollowRequest } from "@/lib/services/social.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const { id } = await params;
    await acceptFollowRequest(auth.userId, id);
    return successResponse({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Friend request not found") {
      return errors.notFound("Friend request");
    }
    console.error("[POST /api/social/follow-requests/:id/accept]", err);
    return errors.serverError();
  }
}
