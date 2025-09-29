# Huntsman CRM

Temporary stage-5 auth uses static tokens defined in `CRM_AUTH_USERS`. Provide them as comma-separated `token:userId:role` entries (optional display name fourth value). Example:

```bash
CRM_AUTH_USERS="token-1:alice:ADMIN:Alice Smith,token-2:bob:SALES"
```

Include the token in API requests via the `Authorization: Bearer <token>` or `x-session-token` header. Mutating endpoints also produce audit records in the `AuditLog` table that capture the acting user and the before/after snapshots of the entity.
