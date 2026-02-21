import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { successResponse, errors } from "@/lib/api/response";
import { validateBody } from "@/lib/api/validate";
import { clearLocation, getLocation, updateLocation } from "@/lib/services/user.service";
import { LOCATION_CELL_PRECISION } from "@/lib/location/geohash";

const locationSchema = z.object({
  cellId: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      new RegExp(`^[0123456789bcdefghjkmnpqrstuvwxyz]{${LOCATION_CELL_PRECISION}}$`),
      `cellId must be a geohash with precision ${LOCATION_CELL_PRECISION}`
    ),
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
      validated.data.cellId
    );

    return successResponse(location);
  } catch (err) {
    console.error("[PUT /api/profile/location]", err);
    return errors.serverError();
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.id) {
      return errors.unauthorized();
    }

    const location = await clearLocation(session.id);
    return successResponse(location);
  } catch (err) {
    console.error("[DELETE /api/profile/location]", err);
    return errors.serverError();
  }
}
