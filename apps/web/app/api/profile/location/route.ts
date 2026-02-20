import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { getLocation, updateLocation } from "@/lib/services/user.service";

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const location = await getLocation(session.id);
    return successResponse(location);
  } catch (err) {
    console.error("[GET /api/profile/location]", err);
    return errors.serverError();
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const validated = await validateBody(request, locationSchema);
    if ("error" in validated) return validated.error;

    const location = await updateLocation(
      session.id,
      validated.data.latitude,
      validated.data.longitude
    );

    return successResponse(location);
  } catch (err) {
    console.error("[PUT /api/profile/location]", err);
    return errors.serverError();
  }
}
