import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import {
  getProfile,
  updateProfile,
  HandleTakenError,
} from "@/lib/services/user.service";

const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .trim(),
  lastName: z
    .string()
    .min(1, "Sobrenome é obrigatório")
    .max(50, "Sobrenome deve ter no máximo 50 caracteres")
    .trim(),
  handle: z
    .string()
    .min(3, "Username deve ter pelo menos 3 caracteres")
    .max(30, "Username deve ter no máximo 30 caracteres")
    .regex(
      /^[a-z][a-z0-9_.]*$/,
      "Username deve começar com letra e conter apenas letras minúsculas, números, _ ou ."
    ),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const profile = await getProfile(session.id);
    if (!profile) return errors.notFound("User");

    return successResponse(profile);
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return errors.serverError();
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const validated = await validateBody(request, updateProfileSchema);
    if ("error" in validated) return validated.error;

    const updated = await updateProfile(session.id, validated.data);

    // Update session with new values
    session.handle = updated.handle;
    session.firstName = updated.firstName;
    session.lastName = updated.lastName;
    session.displayName = updated.displayName;
    await session.save();

    return successResponse(updated);
  } catch (err) {
    if (err instanceof HandleTakenError) {
      return errors.validationError("Este username já está em uso");
    }
    console.error("[PATCH /api/profile]", err);
    return errors.serverError();
  }
}
