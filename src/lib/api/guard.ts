import { NextRequest } from "next/server";

import { ApiError, UnauthorizedError } from "./errors";

const API_KEY_HEADER = "x-api-key";

function resolveExpectedKeys(): string[] {
  const raw = process.env.INTERNAL_API_KEY || process.env.CRM_API_KEY;
  if (!raw) {
    throw new ApiError(500, "api_key_not_configured", "API key guard is not configured");
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function extractPresentedKey(request: NextRequest): string | null {
  const headerKey = request.headers.get(API_KEY_HEADER);
  if (headerKey) {
    return headerKey;
  }

  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return null;
}

export function requireApiKey(request: NextRequest): string {
  const provided = extractPresentedKey(request);
  if (!provided) {
    throw new UnauthorizedError("Missing API key");
  }

  const expectedKeys = resolveExpectedKeys();

  if (!expectedKeys.includes(provided)) {
    throw new UnauthorizedError("Invalid API key");
  }

  return provided;
}
