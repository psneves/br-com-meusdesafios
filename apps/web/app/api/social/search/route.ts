import { z } from "zod";
import { getAuthContext } from "@/lib/auth/auth-context";
import { successResponse, errors } from "@/lib/api/response";
import { validateQuery } from "@/lib/api/validate";
import { searchUsers } from "@/lib/services/social.service";
import { rateLimit } from "@/lib/api/rate-limit";

const searchSchema = z.object({
  q: z.string().min(1, "Search query is required"),
});

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const limited = rateLimit(`search:${auth.userId}`, 60); // 60 searches/min
    if (limited) return limited;

    const { searchParams } = new URL(request.url);
    const validation = validateQuery(searchParams, searchSchema);
    if ("error" in validation) {
      return validation.error;
    }

    const users = await searchUsers(auth.userId, validation.data.q);
    return successResponse({ users });
  } catch (err) {
    console.error("[GET /api/social/search]", err);
    return errors.serverError();
  }
}
