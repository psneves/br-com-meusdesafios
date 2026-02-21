import { z } from "zod";
import { getAuthContext } from "@/lib/auth/auth-context";
import { validateBody } from "@/lib/api/validate";
import { successResponse, errors } from "@/lib/api/response";
import { updatePushToken } from "@/lib/services/mobile-device.service";

const schema = z.object({
  deviceId: z.string().min(1).max(255),
  pushToken: z.string().min(1).max(512),
});

export async function PUT(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const validated = await validateBody(request, schema);
    if ("error" in validated) return validated.error;

    const { deviceId, pushToken } = validated.data;
    await updatePushToken(auth.userId, deviceId, pushToken);

    return successResponse({ ok: true });
  } catch (err) {
    console.error("[PUT /api/mobile/devices/push-token]", err);
    return errors.serverError();
  }
}
