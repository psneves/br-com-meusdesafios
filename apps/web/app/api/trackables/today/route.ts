import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { buildTodayResponse } from "@/lib/services/trackable.service";
import { successResponse, errors } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

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

    const todayResponse = await buildTodayResponse(session.id, date);
    return successResponse(todayResponse);
  } catch (err) {
    console.error("[GET /api/trackables/today]", err);
    return errors.serverError();
  }
}
