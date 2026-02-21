import { z } from "zod";
import { getAuthContext } from "@/lib/auth/auth-context";
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

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const location = await getLocation(auth.userId);
    return successResponse(location);
  } catch (err) {
    console.error("[GET /api/profile/location]", err);
    return errors.serverError();
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const validated = await validateBody(request, locationSchema);
    if ("error" in validated) return validated.error;

    const location = await updateLocation(
      auth.userId,
      validated.data.cellId
    );

    return successResponse(location);
  } catch (err) {
    console.error("[PUT /api/profile/location]", err);
    return errors.serverError();
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const location = await clearLocation(auth.userId);
    return successResponse(location);
  } catch (err) {
    console.error("[DELETE /api/profile/location]", err);
    return errors.serverError();
  }
}
