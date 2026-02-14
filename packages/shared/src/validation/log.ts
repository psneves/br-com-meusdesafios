import { z } from "zod";

export const logMetaSchema = z
  .object({
    source: z.enum(["manual", "import"]).optional(),
    notes: z.string().max(500).optional(),
    bedtime: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    durationMin: z.number().min(0).max(1440).optional(),
    items: z.array(z.string()).optional(),
    unit: z.enum(["km", "mi", "min", "ml", "L"]).optional(),
  })
  .optional();

export const createLogSchema = z.object({
  userTrackableId: z.string().uuid(),
  occurredAt: z.coerce.date().optional(),
  valueNum: z.number().optional(),
  valueText: z.string().max(100).optional(),
  meta: logMetaSchema,
});

export type CreateLogInput = z.infer<typeof createLogSchema>;

// Anti-cheat limits
export const LOG_LIMITS = {
  WATER_MAX_ML_PER_DAY: 15000,
  WATER_MAX_ML_PER_LOG: 2000,
  RUN_MAX_KM_PER_DAY: 200,
  BIKE_MAX_KM_PER_DAY: 500,
  SWIM_MAX_KM_PER_DAY: 50,
  GYM_MAX_MINUTES_PER_DAY: 480,
  SLEEP_MAX_MINUTES: 1440,
} as const;

export function validateLogValue(
  category: string,
  valueNum?: number
): boolean {
  if (valueNum === undefined) return true;

  switch (category) {
    case "WATER":
      return valueNum > 0 && valueNum <= LOG_LIMITS.WATER_MAX_ML_PER_LOG;
    case "RUN":
      return valueNum > 0 && valueNum <= LOG_LIMITS.RUN_MAX_KM_PER_DAY;
    case "BIKE":
      return valueNum > 0 && valueNum <= LOG_LIMITS.BIKE_MAX_KM_PER_DAY;
    case "SWIM":
      return valueNum > 0 && valueNum <= LOG_LIMITS.SWIM_MAX_KM_PER_DAY;
    case "GYM":
      return valueNum > 0 && valueNum <= LOG_LIMITS.GYM_MAX_MINUTES_PER_DAY;
    case "SLEEP":
      return valueNum > 0 && valueNum <= LOG_LIMITS.SLEEP_MAX_MINUTES;
    default:
      return true;
  }
}
