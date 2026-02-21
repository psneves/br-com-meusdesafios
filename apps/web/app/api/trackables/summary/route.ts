import { getAuthContext } from "@/lib/auth/auth-context";
import { buildWeeklySummary, buildMonthlySummary } from "@/lib/services/trackable.service";
import { successResponse, errors } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    let date: Date;
    if (dateParam) {
      date = new Date(`${dateParam}T12:00:00`);
      if (Number.isNaN(date.getTime())) {
        return errors.badRequest("Invalid date format. Use YYYY-MM-DD.");
      }
    } else {
      date = new Date();
    }

    const [weekSummary, monthSummary] = await Promise.all([
      buildWeeklySummary(auth.userId, date),
      buildMonthlySummary(auth.userId, date),
    ]);

    return successResponse({ weekSummary, monthSummary });
  } catch (err) {
    console.error("[GET /api/trackables/summary]", err);
    return errors.serverError();
  }
}
