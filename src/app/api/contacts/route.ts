import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { handleApiError, NotFoundError } from "@/lib/api/errors";
import { requireApiKey } from "@/lib/api/guard";
import { buildPaginationMeta, parsePaginationParams } from "@/lib/api/pagination";
import { contactCreateSchema, contactFilterSchema, contactResponseSchema } from "@/schemas/contact";

function serializeContact(contact: any) {
  return contactResponseSchema.parse({
    id: contact.id,
    companyId: contact.companyId,
    firstName: contact.firstName,
    lastName: contact.lastName ?? null,
    email: contact.email ?? null,
    phone: contact.phone ?? null,
    jobTitle: contact.jobTitle ?? null,
    segment: contact.segment ?? null,
    tags: Array.isArray(contact.tags) ? contact.tags : [],
    notes: contact.notes ?? null,
    createdAt: new Date(contact.createdAt).toISOString(),
    updatedAt: new Date(contact.updatedAt).toISOString(),
    deletedAt: contact.deletedAt ? new Date(contact.deletedAt).toISOString() : null,
  });
}

async function ensureCompanyExists(companyId: string) {
  const company = await (prisma as any).company.findUnique({ where: { id: companyId } });
  if (!company || company.deletedAt) {
    throw new NotFoundError("Company not found");
  }
  return company;
}

export async function GET(request: NextRequest) {
  try {
    requireApiKey(request);

    const pagination = parsePaginationParams(request.nextUrl.searchParams);
    const filters = contactFilterSchema.parse({
      companyId: request.nextUrl.searchParams.get("companyId") ?? undefined,
      segment: request.nextUrl.searchParams.get("segment") ?? undefined,
      tag: request.nextUrl.searchParams.get("tag") ?? undefined,
      email: request.nextUrl.searchParams.get("email") ?? undefined,
      phone: request.nextUrl.searchParams.get("phone") ?? undefined,
    });

    const tags = request.nextUrl.searchParams.getAll("tag");

    const where: Record<string, unknown> = { deletedAt: null };

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
    if (filters.segment) {
      where.segment = { equals: filters.segment, mode: "insensitive" };
    }
    if (filters.email) {
      where.email = { contains: filters.email, mode: "insensitive" };
    }
    if (filters.phone) {
      where.phone = { contains: filters.phone, mode: "insensitive" };
    }

    const normalizedTags = tags.length ? tags : filters.tag ? [filters.tag] : [];
    if (normalizedTags.length) {
      where.tags = { hasSome: normalizedTags };
    }

    const [items, total] = await Promise.all([
      (prisma as any).contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pagination.skip,
        take: pagination.take,
      }),
      (prisma as any).contact.count({ where }),
    ]);

    const data = items.map(serializeContact);

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
    const result = contactCreateSchema.safeParse(payload);
    if (!result.success) {
      throw result.error;
    }

    await ensureCompanyExists(result.data.companyId);

    const contact = await (prisma as any).contact.create({
      data: {
        companyId: result.data.companyId,
        firstName: result.data.firstName,
        lastName: result.data.lastName ?? null,
        email: result.data.email ?? null,
        phone: result.data.phone ?? null,
        jobTitle: result.data.jobTitle ?? null,
        segment: result.data.segment ?? null,
        tags: result.data.tags ?? [],
        notes: result.data.notes ?? null,
      },
    });

    return NextResponse.json({ data: serializeContact(contact) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
