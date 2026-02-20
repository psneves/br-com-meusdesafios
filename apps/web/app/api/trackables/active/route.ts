import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { toggleActive } from "@/lib/services/trackable.service";
import { validateBody } from "@/lib/api/validate";
import { successResponse, errors } from "@/lib/api/response";

const activeSchema = z.object({
  category: z.enum(["WATER", "DIET_CONTROL", "PHYSICAL_EXERCISE", "SLEEP"]),
});

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const validation = await validateBody(request, activeSchema);
    if ("error" in validation) {
      return validation.error;
    }

    const result = await toggleActive(session.id, validation.data.category);
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
