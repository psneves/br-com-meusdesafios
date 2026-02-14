import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

// Common error responses
export const errors = {
  unauthorized: () => errorResponse("UNAUTHORIZED", "Authentication required", 401),
  forbidden: () => errorResponse("FORBIDDEN", "Access denied", 403),
  notFound: (resource = "Resource") =>
    errorResponse("NOT_FOUND", `${resource} not found`, 404),
  badRequest: (message: string) => errorResponse("BAD_REQUEST", message, 400),
  validationError: (message: string) =>
    errorResponse("VALIDATION_ERROR", message, 422),
  serverError: (message = "Internal server error") =>
    errorResponse("SERVER_ERROR", message, 500),
};
