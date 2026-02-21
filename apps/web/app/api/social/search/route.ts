import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { validateQuery } from "@/lib/api/validate";
import { searchUsers } from "@/lib/services/social.service";
import { rateLimit } from "@/lib/api/rate-limit";

const searchSchema = z.object({
  q: z.string().min(1, "Search query is required"),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const limited = rateLimit(`search:${session.id}`, 60); // 60 searches/min
    if (limited) return limited;

    const { searchParams } = new URL(request.url);
    const validation = validateQuery(searchParams, searchSchema);
    if ("error" in validation) {
      return validation.error;
    }

    const users = await searchUsers(session.id, validation.data.q);
    return successResponse({ users });
  } catch (err) {
    console.error("[GET /api/social/search]", err);
    return errors.serverError();
  }
}
