import { z } from "zod";
import {
  rotateRefreshToken,
  createAccessToken,
} from "@/lib/auth/mobile-token";
import { validateBody } from "@/lib/api/validate";
import { successResponse, errors } from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";

const schema = z.object({
  refreshToken: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const limited = rateLimit(
      `refresh:${request.headers.get("x-forwarded-for") || "unknown"}`,
      20
    );
    if (limited) return limited;

    const validated = await validateBody(request, schema);
    if ("error" in validated) return validated.error;

    const result = await rotateRefreshToken(validated.data.refreshToken);
    if (!result) return errors.unauthorized();

    const accessToken = await createAccessToken(result.userId);
    const ACCESS_TTL_MIN =
      Number(process.env.MOBILE_ACCESS_TOKEN_TTL_MIN) || 15;

    return successResponse({
      accessToken,
      refreshToken: result.newRefreshToken,
      expiresIn: ACCESS_TTL_MIN * 60,
    });
  } catch (err) {
    console.error("[POST /api/mobile/auth/refresh]", err);
    return errors.serverError();
  }
}
