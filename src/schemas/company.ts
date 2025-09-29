import { z } from "zod";

const tagSchema = z.string().min(1).max(64);

export const companyIdSchema = z.object({
  id: z.string().uuid(),
});

export const companyCreateSchema = z
  .object({
    name: z.string().min(1).max(255),
    website: z.string().url().optional(),
    industry: z.string().min(1).max(128).optional(),
    segment: z.string().min(1).max(64).optional(),
    description: z.string().min(1).max(1024).optional(),
    tags: z.array(tagSchema).optional(),
  })
  .strict();

export const companyUpdateSchema = companyCreateSchema.partial();

export const companySearchSchema = z
  .object({
    search: z.string().min(1).max(255).optional(),
  })
  .strict();

export const companyResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  website: z.string().url().nullable(),
  industry: z.string().nullable(),
  segment: z.string().nullable(),
  description: z.string().nullable(),
  tags: z.array(tagSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type CompanyIdParams = z.infer<typeof companyIdSchema>;
export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;
export type CompanyResponse = z.infer<typeof companyResponseSchema>;
