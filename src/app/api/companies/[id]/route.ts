import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { handleApiError, NotFoundError } from "@/lib/api/errors";
import { requireApiKey } from "@/lib/api/guard";
import { companyIdSchema, companyResponseSchema, companyUpdateSchema } from "@/schemas/company";

function serializeCompany(company: any) {
  return companyResponseSchema.parse({
    id: company.id,
    name: company.name,
    website: company.website ?? null,
    industry: company.industry ?? null,
    segment: company.segment ?? null,
    description: company.description ?? null,
    tags: Array.isArray(company.tags) ? company.tags : [],
    createdAt: new Date(company.createdAt).toISOString(),
    updatedAt: new Date(company.updatedAt).toISOString(),
    deletedAt: company.deletedAt ? new Date(company.deletedAt).toISOString() : null,
  });
}

async function getCompanyOrThrow(id: string) {
  const company = await (prisma as any).company.findUnique({ where: { id } });
  if (!company || company.deletedAt) {
    throw new NotFoundError("Company not found");
  }
  return company;
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    requireApiKey(request);

    const params = companyIdSchema.parse(context.params);
    const company = await getCompanyOrThrow(params.id);
    return NextResponse.json({ data: serializeCompany(company) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    requireApiKey(request);

    const params = companyIdSchema.parse(context.params);
    await getCompanyOrThrow(params.id);

    const payload = await request.json();
    const result = companyUpdateSchema.safeParse(payload);
    if (!result.success) {
      throw result.error;
    }

    const updateData: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(result.data, "name")) {
      updateData.name = result.data.name;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "website")) {
      updateData.website = result.data.website ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "industry")) {
      updateData.industry = result.data.industry ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "segment")) {
      updateData.segment = result.data.segment ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "description")) {
      updateData.description = result.data.description ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "tags")) {
      updateData.tags = result.data.tags ?? [];
    }

    const company = await (prisma as any).company.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ data: serializeCompany(company) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    requireApiKey(request);

    const params = companyIdSchema.parse(context.params);
    await getCompanyOrThrow(params.id);

    const company = await (prisma as any).company.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: serializeCompany(company) });
  } catch (error) {
    return handleApiError(error);
  }
}
