import { z } from "zod";
import { getAuthContext } from "@/lib/auth/auth-context";
import { toggleActive } from "@/lib/services/trackable.service";
import { validateBody } from "@/lib/api/validate";
import { successResponse, errors } from "@/lib/api/response";

const activeSchema = z.object({
  category: z.enum(["WATER", "DIET_CONTROL", "PHYSICAL_EXERCISE", "SLEEP"]),
});

export async function PUT(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const validation = await validateBody(request, activeSchema);
    if ("error" in validation) {
      return validation.error;
    }

    const result = await toggleActive(auth.userId, validation.data.category);
    return successResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "UserTrackable not found") {
      return errors.notFound("UserTrackable");
    }
    console.error("[PUT /api/trackables/active]", err);
    return errors.serverError();
  }
}
