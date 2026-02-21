import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { validateQuery } from "@/lib/api/validate";
import { computeLeaderboard } from "@/lib/services/leaderboard.service";
import type { Radius } from "@/lib/types/leaderboard";

const rankSchema = z.object({
  scope: z.enum(["friends", "nearby"]),
  period: z.enum(["week", "month"]),
  radius: z.enum(["50", "100", "500"]).optional(),
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

    const { scope, period, radius: radiusStr } = validation.data;
    const radius = radiusStr ? (Number(radiusStr) as Radius) : undefined;

    const data = await computeLeaderboard(
      session.id,
      scope,
      period,
      radius
    );
    return successResponse(data);
  } catch (err) {
    console.error("[GET /api/leaderboards/rank]", err);
    return errors.serverError();
  }
}
