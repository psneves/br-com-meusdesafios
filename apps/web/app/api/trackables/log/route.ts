import { z } from "zod";
import { getAuthContext } from "@/lib/auth/auth-context";
import { createLog } from "@/lib/services/trackable.service";
import { validateBody } from "@/lib/api/validate";
import { successResponse, errors } from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";

const logSchema = z.object({
  userTrackableId: z.string().uuid(),
  valueNum: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  meta: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const limited = rateLimit(`log:${auth.userId}`, 30); // 30 logs/min
    if (limited) return limited;

    const validation = await validateBody(request, logSchema);
    if ("error" in validation) {
      return validation.error;
    }

    const feedback = await createLog(auth.userId, validation.data);
    return successResponse({ feedback });
  } catch (err) {
    console.error("[POST /api/trackables/log]", err);
    return errors.serverError();
  }
}
