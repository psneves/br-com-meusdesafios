import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    return successResponse({
      id: session.id,
      handle: session.handle ?? "",
      firstName: session.firstName ?? "",
      lastName: session.lastName ?? "",
      displayName: session.displayName,
      avatarUrl: session.avatarUrl ?? null,
    });
  } catch (err) {
    console.error("[GET /api/auth/me]", err);
    return errors.serverError();
  }
}
