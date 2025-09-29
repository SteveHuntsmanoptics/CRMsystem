# Deployment notes

## Environment variables

Set the following variables for temporary auth until Roar SSO is available:

| Variable | Description |
| --- | --- |
| `CRM_AUTH_USERS` | Comma-separated `token:userId:role` entries (optional 4th value for display name) used by middleware for stubbed auth. |

Use strong, unique tokens in production and rotate them regularly. Example: `CRM_AUTH_USERS="token-1:alice:ADMIN,token-2:bob:SALES"`.

## Protected routes

- All `/api/*` routes except `/api/health` require a valid session token present in the `Authorization: Bearer <token>` header or the `x-session-token` header.
- Future UI routes placed under `src/app/(protected)` will also require authentication via the middleware guard.

## Audit logging

Mutating API operations automatically write entries to the `AuditLog` table with the acting user, action, entity type, and before/after snapshots. Ensure the Prisma migrations for this table are applied before deploying.
