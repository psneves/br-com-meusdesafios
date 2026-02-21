import { z } from "zod";
import { revokeRefreshToken } from "@/lib/auth/mobile-token";
import { getAuthContext } from "@/lib/auth/auth-context";
import { validateBody } from "@/lib/api/validate";
import { successResponse, errors } from "@/lib/api/response";

const schema = z.object({
  refreshToken: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const validated = await validateBody(request, schema);
    if ("error" in validated) return validated.error;

    await revokeRefreshToken(validated.data.refreshToken);
    return successResponse({ ok: true });
  } catch (err) {
    console.error("[POST /api/mobile/auth/logout]", err);
    return errors.serverError();
  }
}
