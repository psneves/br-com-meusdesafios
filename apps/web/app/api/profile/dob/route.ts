import { z } from "zod";
import { getAuthContext } from "@/lib/auth/auth-context";
import { successResponse, errors } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { updateDateOfBirth } from "@/lib/services/user.service";

const schema = z.object({
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida"),
});

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const validated = await validateBody(request, schema);
    if ("error" in validated) return validated.error;

    const { dateOfBirth } = validated.data;

    const dob = new Date(dateOfBirth + "T00:00:00");
    const today = new Date();

    // Reject invalid dates (future or impossibly old)
    if (dob > today || dob.getFullYear() < 1900) {
      return errors.badRequest("Data de nascimento inválida");
    }

    // Age validation: must be >= 13
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    if (age < 13) {
      return errors.forbidden();
    }

    const result = await updateDateOfBirth(auth.userId, dateOfBirth);
    return successResponse(result);
  } catch (err) {
    console.error("[POST /api/profile/dob]", err);
    return errors.serverError();
  }
}
