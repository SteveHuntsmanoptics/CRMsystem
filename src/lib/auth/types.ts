export const ROLES = ["ADMIN", "MANAGER", "SALES", "VIEWER"] as const;

export type Role = (typeof ROLES)[number];

export interface SessionUser {
  id: string;
  displayName: string;
  role: Role;
  token?: string;
}

export const ROLE_WEIGHT: Record<Role, number> = {
  ADMIN: 4,
  MANAGER: 3,
  SALES: 2,
  VIEWER: 1,
};
