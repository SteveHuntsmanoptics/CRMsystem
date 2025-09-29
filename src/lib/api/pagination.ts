import { z } from "zod";

const paginationSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type PaginationParams = z.infer<typeof paginationSchema> & {
  skip: number;
  take: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const result = paginationSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!result.success) {
    throw result.error;
  }

  const { page, pageSize } = result.data;

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function buildPaginationMeta(totalItems: number, params: PaginationParams): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / params.pageSize));
  return {
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
}
