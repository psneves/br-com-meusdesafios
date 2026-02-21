import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { unfriend } from "@/lib/services/social.service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const { userId } = await params;
    await unfriend(session.id, userId);
    return successResponse({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Friend not found") {
      return errors.notFound("Friend");
    }
    console.error("[DELETE /api/social/friends/:userId]", err);
    return errors.serverError();
  }
}
