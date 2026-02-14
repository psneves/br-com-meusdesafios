import { z } from "zod";
import { errors } from "./response";

export async function validateBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<{ data: z.infer<T> } | { error: ReturnType<typeof errors.validationError> }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0];
      const message = `${firstError.path.join(".")}: ${firstError.message}`;
      return { error: errors.validationError(message) };
    }

    return { data: result.data };
  } catch {
    return { error: errors.badRequest("Invalid JSON body") };
  }
}

export function validateQuery<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): { data: z.infer<T> } | { error: ReturnType<typeof errors.validationError> } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);

  if (!result.success) {
    const firstError = result.error.errors[0];
    const message = `${firstError.path.join(".")}: ${firstError.message}`;
    return { error: errors.validationError(message) };
  }

  return { data: result.data };
}
