import { NextRequest } from "next/server";

import { UnauthorizedError } from "@/lib/api/errors";

import { Role, ROLES, SessionUser } from "./types";

const SESSION_HEADER = "x-session-token";

let cachedUsers: Map<string, SessionUser> | null = null;

function parseRole(value: string): Role {
  if ((ROLES as readonly string[]).includes(value)) {
    return value as Role;
  }

  throw new Error(`Unsupported role \"${value}\" in CRM_AUTH_USERS`);
}

function loadStubUsers(): Map<string, SessionUser> {
  if (cachedUsers) {
    return cachedUsers;
  }

  const raw = process.env.CRM_AUTH_USERS;
  if (!raw) {
    throw new Error("CRM_AUTH_USERS is not configured. Set a comma-separated list of token:id:role triples.");
  }

  const map = new Map<string, SessionUser>();

  for (const entry of raw.split(",")) {
    const trimmed = entry.trim();
    if (!trimmed) {
      continue;
    }

    const [token, id, role, displayName] = trimmed.split(":");
    if (!token || !id || !role) {
      throw new Error(`Invalid CRM_AUTH_USERS entry: ${trimmed}`);
    }

    const parsedRole = parseRole(role);
    map.set(token, {
      id,
      displayName: displayName || id,
      role: parsedRole,
    });
  }

  cachedUsers = map;
  return map;
}

function extractToken(request: NextRequest): string | null {
  const explicitHeader = request.headers.get(SESSION_HEADER);
  if (explicitHeader) {
    return explicitHeader.trim();
  }

  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  const cookie = request.cookies.get("session-token");
  if (cookie?.value) {
    return cookie.value;
  }

  return null;
}

export async function getSessionUser(request: NextRequest): Promise<SessionUser & { token: string }> {
  const token = extractToken(request);
  if (!token) {
    throw new UnauthorizedError("Missing session token");
  }

  const users = loadStubUsers();
  const session = users.get(token);
  if (!session) {
    throw new UnauthorizedError("Invalid session token");
  }

  return { ...session, token };
}

export function __resetAuthCache() {
  cachedUsers = null;
}
