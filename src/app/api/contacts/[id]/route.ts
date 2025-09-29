import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { handleApiError, NotFoundError } from "@/lib/api/errors";
import { requireApiKey } from "@/lib/api/guard";
import { contactIdSchema, contactResponseSchema, contactUpdateSchema } from "@/schemas/contact";

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

async function getContactOrThrow(id: string) {
  const contact = await (prisma as any).contact.findUnique({ where: { id } });
  if (!contact || contact.deletedAt) {
    throw new NotFoundError("Contact not found");
  }
  return contact;
}

async function ensureCompanyExists(companyId: string) {
  const company = await (prisma as any).company.findUnique({ where: { id: companyId } });
  if (!company || company.deletedAt) {
    throw new NotFoundError("Company not found");
  }
  return company;
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    requireApiKey(request);

    const params = contactIdSchema.parse(context.params);
    const contact = await getContactOrThrow(params.id);

    return NextResponse.json({ data: serializeContact(contact) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    requireApiKey(request);

    const params = contactIdSchema.parse(context.params);
    await getContactOrThrow(params.id);

    const payload = await request.json();
    const result = contactUpdateSchema.safeParse(payload);
    if (!result.success) {
      throw result.error;
    }

    if (result.data.companyId) {
      await ensureCompanyExists(result.data.companyId);
    }

    const updateData: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(result.data, "companyId")) {
      updateData.companyId = result.data.companyId;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "firstName")) {
      updateData.firstName = result.data.firstName;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "lastName")) {
      updateData.lastName = result.data.lastName ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "email")) {
      updateData.email = result.data.email ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "phone")) {
      updateData.phone = result.data.phone ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "jobTitle")) {
      updateData.jobTitle = result.data.jobTitle ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "segment")) {
      updateData.segment = result.data.segment ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "tags")) {
      updateData.tags = result.data.tags ?? [];
    }
    if (Object.prototype.hasOwnProperty.call(result.data, "notes")) {
      updateData.notes = result.data.notes ?? null;
    }

    const contact = await (prisma as any).contact.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ data: serializeContact(contact) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    requireApiKey(request);

    const params = contactIdSchema.parse(context.params);
    await getContactOrThrow(params.id);

    const contact = await (prisma as any).contact.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: serializeContact(contact) });
  } catch (error) {
    return handleApiError(error);
  }
}
