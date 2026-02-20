import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { validateQuery } from "@/lib/api/validate";
import { computeLeaderboard } from "@/lib/services/leaderboard.service";

const rankSchema = z.object({
  scope: z.enum(["following", "followers"]),
  period: z.enum(["week", "month"]),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const validation = validateQuery(searchParams, rankSchema);
    if ("error" in validation) {
      return validation.error;
    }

    const data = await computeLeaderboard(
      session.id,
      validation.data.scope,
      validation.data.period
    );
    return successResponse(data);
  } catch (err) {
    console.error("[GET /api/leaderboards/rank]", err);
    return errors.serverError();
  }
}
