import { getAuthContext } from "@/lib/auth/auth-context";
import { getUserSettings } from "@/lib/services/trackable.service";
import { successResponse, errors } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const settings = await getUserSettings(auth.userId);
    return successResponse({ settings });
  } catch (err) {
    console.error("[GET /api/trackables/settings]", err);
    return errors.serverError();
  }
}
