import { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/auth/auth-context";
import { successResponse, errors } from "@/lib/api/response";
import { isHandleAvailable } from "@/lib/services/user.service";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const handle = request.nextUrl.searchParams.get("handle");
    if (!handle || handle.length < 3) {
      return successResponse({ available: false });
    }

    const available = await isHandleAvailable(handle, auth.userId);
    return successResponse({ available });
  } catch (err) {
    console.error("[GET /api/profile/check-handle]", err);
    return errors.serverError();
  }
}
