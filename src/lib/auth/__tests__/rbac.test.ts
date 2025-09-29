import { describe, expect, it } from "vitest";

import { ForbiddenError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth";

describe("requireRole", () => {
  it("throws when user role is insufficient", () => {
    const user = { id: "viewer-1", displayName: "Viewer", role: "VIEWER" } as const;

    expect(() => requireRole({ ...user }, "SALES")).toThrow(ForbiddenError);
  });
});
