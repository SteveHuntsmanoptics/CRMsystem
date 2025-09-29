import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NextRequest } from "next/server";

import { __resetAuthCache } from "@/lib/auth/session";

const mockCompanyModel = {
  create: vi.fn(),
  update: vi.fn(),
  findUnique: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { company: mockCompanyModel },
}));

vi.mock("@/server/audit", () => ({
  writeAuditLog: vi.fn(async () => undefined),
}));

import { writeAuditLog } from "@/server/audit";
import { POST, DELETE } from "../route";

function createRequest(method: string, body?: unknown) {
  const url = new URL("http://localhost/api/companies");
  const headers = new Headers({ "x-session-token": "admin-token" });
  return {
    method,
    headers,
    nextUrl: url,
    json: async () => body,
  } as unknown as NextRequest;
}

const baseCompany = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Acme Corp",
  website: null,
  industry: null,
  segment: null,
  description: null,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe("companies API audit logging", () => {
  beforeEach(() => {
    process.env.CRM_AUTH_USERS = "admin-token:admin:ADMIN";
    __resetAuthCache();
    mockCompanyModel.create.mockReset();
    mockCompanyModel.update.mockReset();
    mockCompanyModel.findUnique.mockReset();
    vi.mocked(writeAuditLog).mockClear();
  });

  it("writes an audit log when creating a company", async () => {
    mockCompanyModel.create.mockResolvedValue({ ...baseCompany });

    const request = createRequest("POST", { name: "Acme Corp" });
    await POST(request as any);

    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CREATE",
        entity: "company",
        entityId: baseCompany.id,
      }),
    );
  });

  it("writes an audit log when deleting a company", async () => {
    mockCompanyModel.findUnique.mockResolvedValueOnce({ ...baseCompany });
    mockCompanyModel.update.mockResolvedValue({
      ...baseCompany,
      deletedAt: new Date(),
    });

    const request = createRequest("DELETE");
    await DELETE(request as any, { params: { id: baseCompany.id } });

    expect(writeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DELETE",
        entity: "company",
        entityId: baseCompany.id,
      }),
    );
  });
});
