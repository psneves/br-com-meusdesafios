import { z } from "zod";
import { getAuthContext } from "@/lib/auth/auth-context";
import { updateGoal } from "@/lib/services/trackable.service";
import { validateBody } from "@/lib/api/validate";
import { successResponse, errors } from "@/lib/api/response";

const goalSchema = z.object({
  category: z.enum(["WATER", "DIET_CONTROL", "PHYSICAL_EXERCISE", "SLEEP"]),
  target: z.number().positive(),
});

export async function PUT(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const validation = await validateBody(request, goalSchema);
    if ("error" in validation) {
      return validation.error;
    }

    await updateGoal(auth.userId, validation.data);
    return successResponse({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "UserTrackable not found") {
      return errors.notFound("UserTrackable");
    }
    console.error("[PUT /api/trackables/goal]", err);
    return errors.serverError();
  }
}
