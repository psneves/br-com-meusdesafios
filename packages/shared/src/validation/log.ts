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
    checklistMet: z.boolean().optional(),
    unit: z.enum(["km", "mi", "min", "ml", "L"]).optional(),
    exerciseModality: z.enum(["GYM", "RUN", "CYCLING", "SWIM"]).optional(),
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
  EXERCISE_RUN_MAX_KM_PER_DAY: 200,
  EXERCISE_CYCLING_MAX_KM_PER_DAY: 500,
  EXERCISE_SWIM_MAX_KM_PER_DAY: 50,
  EXERCISE_GYM_MAX_MINUTES_PER_DAY: 480,
  SLEEP_MAX_MINUTES: 1440,
} as const;

export function validateLogValue(
  category: string,
  valueNum?: number,
  exerciseModality?: string
): boolean {
  if (valueNum === undefined) return true;

  switch (category) {
    case "WATER":
      return valueNum > 0 && valueNum <= LOG_LIMITS.WATER_MAX_ML_PER_LOG;
    case "PHYSICAL_EXERCISE":
      return validateExerciseValue(exerciseModality, valueNum);
    case "SLEEP":
      return valueNum > 0 && valueNum <= LOG_LIMITS.SLEEP_MAX_MINUTES;
    default:
      return true;
  }
}

function validateExerciseValue(
  modality: string | undefined,
  valueNum: number
): boolean {
  if (valueNum <= 0) return false;

  switch (modality) {
    case "RUN":
      return valueNum <= LOG_LIMITS.EXERCISE_RUN_MAX_KM_PER_DAY;
    case "CYCLING":
      return valueNum <= LOG_LIMITS.EXERCISE_CYCLING_MAX_KM_PER_DAY;
    case "SWIM":
      return valueNum <= LOG_LIMITS.EXERCISE_SWIM_MAX_KM_PER_DAY;
    case "GYM":
      return valueNum <= LOG_LIMITS.EXERCISE_GYM_MAX_MINUTES_PER_DAY;
    default:
      return true;
  }
}
