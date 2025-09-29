import { ForbiddenError } from "@/lib/api/errors";

import { ROLE_WEIGHT, Role, SessionUser } from "./types";

function hasRequiredRole(userRole: Role, requiredRole: Role) {
  return ROLE_WEIGHT[userRole] >= ROLE_WEIGHT[requiredRole];
}

export function requireRole<T extends SessionUser>(
  user: T,
  required: Role | Role[],
): T {
  const requiredRoles = Array.isArray(required) ? required : [required];

  const isAllowed = requiredRoles.some((role) => hasRequiredRole(user.role, role));
  if (!isAllowed) {
    throw new ForbiddenError("Insufficient role for requested action");
  }

  return user;
}

export function canAccess(user: SessionUser, required: Role | Role[]) {
  const requiredRoles = Array.isArray(required) ? required : [required];
  return requiredRoles.some((role) => hasRequiredRole(user.role, role));
}
