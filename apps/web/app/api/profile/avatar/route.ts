import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { updateAvatar } from "@/lib/services/user.service";
import { rateLimit } from "@/lib/api/rate-limit";

const MAX_DECODED_SIZE = 500 * 1024; // 500KB

const avatarSchema = z.object({
  image: z
    .string()
    .regex(
      /^data:image\/(jpeg|png|webp);base64,/,
      "Formato inválido. Use JPEG, PNG ou WebP."
    ),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const limited = rateLimit(`avatar:${session.id}`, 5, 300_000); // 5 uploads/5min
    if (limited) return limited;

    const validated = await validateBody(request, avatarSchema);
    if ("error" in validated) return validated.error;

    const { image } = validated.data;

    // Validate decoded size
    const base64Data = image.split(",")[1];
    const decodedSize = Math.ceil((base64Data.length * 3) / 4);
    if (decodedSize > MAX_DECODED_SIZE) {
      return errors.validationError(
        "Imagem muito grande. O tamanho máximo é 500KB."
      );
    }

    const avatarUrl = await updateAvatar(session.id, image);

    // Note: we do NOT store base64 in the session cookie (too large for ~4KB limit).
    // The /api/auth/me endpoint reads avatarUrl directly from the database.

    return successResponse({ avatarUrl });
  } catch (err) {
    console.error("[POST /api/profile/avatar]", err);
    return errors.serverError();
  }
}
