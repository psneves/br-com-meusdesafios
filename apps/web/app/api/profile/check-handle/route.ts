import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { isHandleAvailable } from "@/lib/services/user.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const handle = request.nextUrl.searchParams.get("handle");
    if (!handle || handle.length < 3) {
      return successResponse({ available: false });
    }

    const available = await isHandleAvailable(handle, session.id);
    return successResponse({ available });
  } catch (err) {
    console.error("[GET /api/profile/check-handle]", err);
    return errors.serverError();
  }
}
