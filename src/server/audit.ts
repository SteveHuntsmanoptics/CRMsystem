import prisma from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface AuditLogPayload {
  user: SessionUser;
  action: AuditAction;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}

const actionToVerb: Record<AuditAction, string> = {
  CREATE: "created",
  UPDATE: "updated",
  DELETE: "deleted",
};

function serializeSnapshot(snapshot: unknown) {
  if (snapshot === undefined) {
    return null;
  }

  try {
    return JSON.parse(JSON.stringify(snapshot));
  } catch (error) {
    console.warn("Failed to serialize snapshot for audit log", error);
    return null;
  }
}

export async function writeAuditLog(payload: AuditLogPayload) {
  const { user, action, entity, entityId } = payload;

  try {
    await (prisma as any).auditLog.create({
      data: {
        actorId: user.id,
        actorDisplayName: user.displayName,
        actorRole: user.role,
        action,
        actionDisplay: `${user.displayName} ${actionToVerb[action]} ${entity} ${entityId}`.trim(),
        entity,
        entityId,
        before: serializeSnapshot(payload.before),
        after: serializeSnapshot(payload.after),
      },
    });
  } catch (error) {
    console.error("Failed to write audit log entry", error);
  }
}
