import { NextResponse } from "next/server";

const paginationMetaSchema = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1 },
    pageSize: { type: "integer", minimum: 1 },
    totalItems: { type: "integer", minimum: 0 },
    totalPages: { type: "integer", minimum: 1 },
    hasNextPage: { type: "boolean" },
    hasPreviousPage: { type: "boolean" },
  },
  required: ["page", "pageSize", "totalItems", "totalPages", "hasNextPage", "hasPreviousPage"],
};

const companySchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    website: { type: ["string", "null"], format: "uri" },
    industry: { type: ["string", "null"] },
    segment: { type: ["string", "null"] },
    description: { type: ["string", "null"] },
    tags: { type: "array", items: { type: "string" } },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    deletedAt: { type: ["string", "null"], format: "date-time" },
  },
  required: [
    "id",
    "name",
    "website",
    "industry",
    "segment",
    "description",
    "tags",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ],
};

const contactSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    companyId: { type: "string", format: "uuid" },
    firstName: { type: "string" },
    lastName: { type: ["string", "null"] },
    email: { type: ["string", "null"], format: "email" },
    phone: { type: ["string", "null"] },
    jobTitle: { type: ["string", "null"] },
    segment: { type: ["string", "null"] },
    tags: { type: "array", items: { type: "string" } },
    notes: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    deletedAt: { type: ["string", "null"], format: "date-time" },
  },
  required: [
    "id",
    "companyId",
    "firstName",
    "lastName",
    "email",
    "phone",
    "jobTitle",
    "segment",
    "tags",
    "notes",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ],
};

const errorSchema = {
  type: "object",
  properties: {
    error: {
      type: "object",
      properties: {
        code: { type: "string" },
        message: { type: "string" },
        details: {},
      },
      required: ["code", "message"],
    },
  },
  required: ["error"],
};

const document = {
  openapi: "3.1.0",
  info: {
    title: "CRM REST API",
    version: "1.0.0",
    description: "CRUD endpoints for companies and contacts in the CRM system.",
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
    },
  ],
  security: [{ ApiKeyAuth: [] }],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
      },
    },
    schemas: {
      Company: companySchema,
      Contact: contactSchema,
      PaginationMeta: paginationMetaSchema,
      ErrorResponse: errorSchema,
      CompanyCreateInput: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1 },
          website: { type: "string", format: "uri" },
          industry: { type: "string" },
          segment: { type: "string" },
          description: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["name"],
        additionalProperties: false,
      },
      CompanyUpdateInput: {
        allOf: [
          { $ref: "#/components/schemas/CompanyCreateInput" },
          { type: "object", required: [] },
        ],
      },
      ContactCreateInput: {
        type: "object",
        properties: {
          companyId: { type: "string", format: "uuid" },
          firstName: { type: "string", minLength: 1 },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          jobTitle: { type: "string" },
          segment: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          notes: { type: "string" },
        },
        required: ["companyId", "firstName"],
        additionalProperties: false,
      },
      ContactUpdateInput: {
        allOf: [
          { $ref: "#/components/schemas/ContactCreateInput" },
          { type: "object", required: [] },
        ],
      },
    },
  },
  paths: {
    "/api/companies": {
      get: {
        summary: "List companies",
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Full-text search across name, website, industry, and segment.",
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": {
            description: "A paginated list of companies.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Company" } },
                    meta: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                  required: ["data", "meta"],
                },
              },
            },
          },
          default: {
            description: "Error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      post: {
        summary: "Create a company",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CompanyCreateInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Company created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Company" } },
                  required: ["data"],
                },
              },
            },
          },
          default: {
            description: "Error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/companies/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        summary: "Retrieve a company",
        responses: {
          "200": {
            description: "Company details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Company" } },
                  required: ["data"],
                },
              },
            },
          },
          default: {
            description: "Error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      patch: {
        summary: "Update a company",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CompanyUpdateInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated company",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Company" } },
                  required: ["data"],
                },
              },
            },
          },
          default: {
            description: "Error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      delete: {
        summary: "Soft delete a company",
        responses: {
          "200": {
            description: "Soft deleted company",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Company" } },
                  required: ["data"],
                },
              },
            },
          },
          default: {
            description: "Error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/contacts": {
      get: {
        summary: "List contacts",
        parameters: [
          {
            name: "companyId",
            in: "query",
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "segment",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "tag",
            in: "query",
            schema: { type: "string" },
            description: "Filter by tag. Repeat parameter to match multiple tags.",
          },
          {
            name: "email",
            in: "query",
            schema: { type: "string", format: "email" },
          },
          {
            name: "phone",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": {
            description: "A paginated list of contacts.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Contact" } },
                    meta: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                  required: ["data", "meta"],
                },
              },
            },
          },
          default: {
            description: "Error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      post: {
        summary: "Create a contact",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactCreateInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Contact created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Contact" } },
                  required: ["data"],
                },
              },
            },
          },
          default: {
            description: "Error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/api/contacts/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      get: {
        summary: "Retrieve a contact",
        responses: {
          "200": {
            description: "Contact details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Contact" } },
                  required: ["data"],
                },
              },
            },
          },
          default: {
            description: "Error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      patch: {
        summary: "Update a contact",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactUpdateInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated contact",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Contact" } },
                  required: ["data"],
                },
              },
            },
          },
          default: {
            description: "Error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      delete: {
        summary: "Soft delete a contact",
        responses: {
          "200": {
            description: "Soft deleted contact",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Contact" } },
                  required: ["data"],
                },
              },
            },
          },
          default: {
            description: "Error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(document);
}
