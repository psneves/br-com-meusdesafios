import { NextRequest } from "next/server";
import { getAuthContext } from "@/lib/auth/auth-context";
import { buildTodayResponse } from "@/lib/services/trackable.service";
import { successResponse, errors } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    let date: Date;
    if (dateParam) {
      date = new Date(dateParam + "T00:00:00");
      if (Number.isNaN(date.getTime())) {
        return errors.badRequest("Invalid date format. Use YYYY-MM-DD.");
      }
    } else {
      date = new Date();
    }

    const todayResponse = await buildTodayResponse(auth.userId, date);
    return successResponse(todayResponse);
  } catch (err) {
    console.error("[GET /api/trackables/today]", err);
    return errors.serverError();
  }
}
