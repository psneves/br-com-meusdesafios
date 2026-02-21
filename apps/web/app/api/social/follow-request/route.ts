import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { sendFollowRequest } from "@/lib/services/social.service";
import { rateLimit } from "@/lib/api/rate-limit";

const followRequestSchema = z.object({
  targetHandle: z.string().min(1, "Target handle is required"),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const limited = rateLimit(`follow:${session.id}`, 20); // 20 requests/min
    if (limited) return limited;

    const validation = await validateBody(request, followRequestSchema);
    if ("error" in validation) {
      return validation.error;
    }

    const result = await sendFollowRequest(
      session.id,
      validation.data.targetHandle
    );
    return successResponse(result, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "User not found") {
      return errors.notFound("User");
    }
    if (message === "Cannot follow yourself" || message === "Cannot follow this user") {
      return errors.badRequest(message);
    }
    console.error("[POST /api/social/follow-request]", err);
    return errors.serverError();
  }
}
