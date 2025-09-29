import { z } from "zod";

const tagSchema = z.string().min(1).max(64);

const contactCoreSchema = z
  .object({
    companyId: z.string().uuid(),
    firstName: z.string().min(1).max(120),
    lastName: z.string().min(1).max(120).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).max(32).optional(),
    jobTitle: z.string().min(1).max(120).optional(),
    segment: z.string().min(1).max(64).optional(),
    tags: z.array(tagSchema).optional(),
    notes: z.string().min(1).max(1024).optional(),
  })
  .strict();

export const contactIdSchema = z.object({
  id: z.string().uuid(),
});

export const contactCreateSchema = contactCoreSchema.superRefine((value, ctx) => {
  if (!value.email && !value.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either email or phone must be provided",
      path: ["email"],
    });
  }
});

export const contactUpdateSchema = contactCoreSchema
  .partial()
  .superRefine((value, ctx) => {
    if (value.email === undefined && value.phone === undefined) {
      return;
    }

    if (!value.email && !value.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either email or phone must be provided",
        path: ["email"],
      });
    }
  });

export const contactFilterSchema = z
  .object({
    companyId: z.string().uuid().optional(),
    segment: z.string().min(1).max(64).optional(),
    tag: z.string().min(1).max(64).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).max(32).optional(),
  })
  .strict();

export const contactResponseSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  jobTitle: z.string().nullable(),
  segment: z.string().nullable(),
  tags: z.array(tagSchema),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type ContactIdParams = z.infer<typeof contactIdSchema>;
export type ContactCreateInput = z.infer<typeof contactCreateSchema>;
export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;
export type ContactResponse = z.infer<typeof contactResponseSchema>;
