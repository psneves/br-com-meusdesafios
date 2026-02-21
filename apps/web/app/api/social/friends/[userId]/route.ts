import { getAuthContext } from "@/lib/auth/auth-context";
import { successResponse, errors } from "@/lib/api/response";
import { unfriend } from "@/lib/services/social.service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const { userId } = await params;
    await unfriend(auth.userId, userId);
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
