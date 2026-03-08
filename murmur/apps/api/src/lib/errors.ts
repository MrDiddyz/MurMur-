export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface PostgrestLikeError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export function toApiError(error: unknown, fallbackMessage: string): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const maybePostgrest = error as PostgrestLikeError | undefined;
  if (maybePostgrest?.message) {
    const statusCode = inferStatusCode(maybePostgrest.code);
    return new ApiError(fallbackMessage, statusCode, {
      code: maybePostgrest.code,
      message: maybePostgrest.message,
      details: maybePostgrest.details,
      hint: maybePostgrest.hint
    });
  }

  return new ApiError(fallbackMessage, 500, error);
}

function inferStatusCode(code?: string): number {
  if (code === "23503") return 400;
  if (code === "23505") return 409;
  return 500;
}
