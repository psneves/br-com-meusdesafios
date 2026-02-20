import { getSession } from "@/lib/auth/session";
import { buildWeeklySummary, buildMonthlySummary } from "@/lib/services/trackable.service";
import { successResponse, errors } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(`${dateParam}T12:00:00`) : new Date();

    const [weekSummary, monthSummary] = await Promise.all([
      buildWeeklySummary(session.id, date),
      buildMonthlySummary(session.id, date),
    ]);

    return successResponse({ weekSummary, monthSummary });
  } catch (err) {
    console.error("[GET /api/trackables/summary]", err);
    return errors.serverError();
  }
}
