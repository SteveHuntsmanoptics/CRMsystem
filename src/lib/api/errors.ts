import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  public readonly status: number;

  public readonly code: string;

  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found", details?: unknown) {
    super(404, "not_found", message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(401, "unauthorized", message, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", details?: unknown) {
    super(403, "forbidden", message, details);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request", details?: unknown) {
    super(400, "bad_request", message, details);
  }
}

export function normalizeError(error: unknown): { status: number; body: ErrorBody } {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 422,
      body: {
        error: {
          code: "validation_error",
          message: "Request validation failed",
          details: error.flatten(),
        },
      },
    };
  }

  console.error("Unhandled API error", error);

  return {
    status: 500,
    body: {
      error: {
        code: "internal_server_error",
        message: "An unexpected error occurred",
      },
    },
  };
}

export function handleApiError(error: unknown) {
  const { status, body } = normalizeError(error);
  return NextResponse.json(body, { status });
}
