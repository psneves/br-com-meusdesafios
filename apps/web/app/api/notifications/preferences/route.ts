import { z } from "zod";
import { getAuthContext } from "@/lib/auth/auth-context";
import { validateBody } from "@/lib/api/validate";
import { successResponse, errors } from "@/lib/api/response";
import {
  getNotificationPreferences,
  upsertNotificationPreferences,
} from "@/lib/services/notification.service";

const schema = z.object({
  dailyReminderEnabled: z.boolean(),
  reminderTimeLocal: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Formato HH:MM esperado")
    .nullable()
    .optional(),
  timezone: z.string().max(50).nullable().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const prefs = await getNotificationPreferences(auth.userId);
    return successResponse(prefs);
  } catch (err) {
    console.error("[GET /api/notifications/preferences]", err);
    return errors.serverError();
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthContext(request);
    if (!auth) return errors.unauthorized();

    const validated = await validateBody(request, schema);
    if ("error" in validated) return validated.error;

    const prefs = await upsertNotificationPreferences(
      auth.userId,
      validated.data
    );
    return successResponse(prefs);
  } catch (err) {
    console.error("[PUT /api/notifications/preferences]", err);
    return errors.serverError();
  }
}
