import { z } from "zod";
import { getAuthContext } from "@/lib/auth/auth-context";
import { successResponse, errors } from "@/lib/api/response";
import { validateQuery } from "@/lib/api/validate";
import { computeLeaderboard } from "@/lib/services/leaderboard.service";
import type { Radius } from "@/lib/types/leaderboard";

const rankSchema = z.object({
  scope: z.enum(["friends", "nearby"]),
  period: z.enum(["week", "month"]),
  radius: z.enum(["50", "100", "500"]).optional(),
  view: z.enum(["standard", "all"]).optional().default("standard"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const { searchParams } = new URL(request.url);
    const validation = validateQuery(searchParams, rankSchema);
    if ("error" in validation) {
      return validation.error;
    }

    const {
      scope,
      period,
      radius: radiusStr,
      view,
      page,
      pageSize,
    } = validation.data;
    const radius = radiusStr ? (Number(radiusStr) as Radius) : undefined;

    const data = await computeLeaderboard(
      auth.userId,
      scope,
      period,
      radius,
      { view, page, pageSize }
    );
    return successResponse(data);
  } catch (err) {
    console.error("[GET /api/leaderboards/rank]", err);
    return errors.serverError();
  }
}
