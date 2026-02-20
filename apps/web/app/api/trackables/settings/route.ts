import { getSession } from "@/lib/auth/session";
import { getUserSettings } from "@/lib/services/trackable.service";
import { successResponse, errors } from "@/lib/api/response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const settings = await getUserSettings(session.id);
    return successResponse({ settings });
  } catch (err) {
    console.error("[GET /api/trackables/settings]", err);
    return errors.serverError();
  }
}
