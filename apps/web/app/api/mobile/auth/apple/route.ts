import { z } from "zod";
import { verifyAppleToken } from "@/lib/auth/apple";
import { findOrCreateAppleUser } from "@/lib/auth/user";
import { issueTokenPair } from "@/lib/auth/mobile-token";
import { upsertMobileDevice } from "@/lib/services/mobile-device.service";
import { validateBody } from "@/lib/api/validate";
import { successResponse, errors } from "@/lib/api/response";
import { rateLimit } from "@/lib/api/rate-limit";

const schema = z.object({
  identityToken: z.string().min(1),
  deviceId: z.string().min(1).max(255),
  platform: z.enum(["ios", "android"]),
  appVersion: z.string().max(20).optional(),
  fullName: z.string().max(200).optional(),
  email: z.string().email().optional(),
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

    const { identityToken, deviceId, platform, appVersion, fullName, email } =
      validated.data;

    const appleProfile = await verifyAppleToken(identityToken);
    if (!appleProfile) return errors.unauthorized();

    // Apple only sends name/email on first auth; merge client-provided values
    if (fullName && !appleProfile.name) appleProfile.name = fullName;
    if (email && !appleProfile.email) appleProfile.email = email;

    const user = await findOrCreateAppleUser(appleProfile);
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
    console.error("[POST /api/mobile/auth/apple]", err);
    return errors.serverError();
  }
}
