import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/api/errors";
import { requireApiKey } from "@/lib/api/guard";
import { buildPaginationMeta, parsePaginationParams } from "@/lib/api/pagination";
import {
  companyCreateSchema,
  companyResponseSchema,
  companySearchSchema,
} from "@/schemas/company";

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

export async function GET(request: NextRequest) {
  try {
    requireApiKey(request);

    const pagination = parsePaginationParams(request.nextUrl.searchParams);
    const query = companySearchSchema.parse({
      search: request.nextUrl.searchParams.get("search") ?? undefined,
    });

    const where: Record<string, unknown> = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { website: { contains: query.search, mode: "insensitive" } },
        { industry: { contains: query.search, mode: "insensitive" } },
        { segment: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      (prisma as any).company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      (prisma as any).company.count({ where }),
    ]);

    const data = items.map(serializeCompany);

    return NextResponse.json({
      data,
      meta: buildPaginationMeta(total, pagination),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireApiKey(request);

    const payload = await request.json();
    const result = companyCreateSchema.safeParse(payload);
    if (!result.success) {
      throw result.error;
    }

    const company = await (prisma as any).company.create({
      data: {
        name: result.data.name,
        website: result.data.website ?? null,
        industry: result.data.industry ?? null,
        segment: result.data.segment ?? null,
        description: result.data.description ?? null,
        tags: result.data.tags ?? [],
      },
    });

    return NextResponse.json({ data: serializeCompany(company) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
