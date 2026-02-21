import { z } from "zod";
import { verifyGoogleToken } from "@/lib/auth/oauth";
import { findOrCreateGoogleUser } from "@/lib/auth/user";
import { issueTokenPair } from "@/lib/auth/mobile-token";
import { upsertMobileDevice } from "@/lib/services/mobile-device.service";
import { validateBody } from "@/lib/api/validate";
import { successResponse, errors } from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";

const schema = z.object({
  idToken: z.string().min(1),
  deviceId: z.string().min(1).max(255),
  platform: z.enum(["ios", "android"]),
  appVersion: z.string().max(20).optional(),
});

export async function POST(request: Request) {
  try {
    const limited = rateLimit(
      `mobile-auth:${request.headers.get("x-forwarded-for") || "unknown"}`,
      10
    );
    if (limited) return limited;

    const validated = await validateBody(request, schema);
    if ("error" in validated) return validated.error;

    const { idToken, deviceId, platform, appVersion } = validated.data;

    const profile = await verifyGoogleToken(idToken);
    if (!profile) return errors.unauthorized();

    const user = await findOrCreateGoogleUser(profile);
    const tokens = await issueTokenPair(user.id, deviceId);
    await upsertMobileDevice(user.id, deviceId, platform, appVersion);

    return successResponse({
      ...tokens,
      user: {
        id: user.id,
        handle: user.handle,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error("[POST /api/mobile/auth/google]", err);
    return errors.serverError();
  }
}
