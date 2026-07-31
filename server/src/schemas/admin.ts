import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).default(""),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export const customerListSchema = paginationSchema.extend({
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "lastName"]).default("updatedAt")
});

export const quoteListSchema = paginationSchema.extend({
  status: z.enum(["DRAFT", "SENT", "APPROVED", "DECLINED", "EXPIRED"]).optional(),
  assignedToId: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "number", "total"]).default("createdAt")
});

export const serviceRequestListSchema = paginationSchema.extend({
  status: z.enum(["NEW", "REVIEWING", "SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  assignedToId: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "preferredDate"]).default("createdAt")
});

const moneySchema = z.coerce.number().finite().min(0).max(10_000_000).multipleOf(0.01);
const nullableDateSchema = z.union([
  z.iso.datetime({ offset: true }),
  z.iso.date().transform((value) => `${value}T23:59:59.999Z`),
  z.null()
]);

export const quoteUpdateSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "APPROVED", "DECLINED", "EXPIRED"]).optional(),
  assignedToId: z.string().trim().min(1).nullable().optional(),
  internalNotes: z.string().trim().max(5000).nullable().optional()
}).refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: "At least one field must be supplied."
});

export const quoteDetailsSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(5000).nullable().optional(),
  expiresAt: nullableDateSchema.optional(),
  discount: moneySchema.default(0),
  taxRate: z.coerce.number().finite().min(0).max(100).multipleOf(0.01).default(0),
  items: z.array(z.object({
    id: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).max(500),
    quantity: z.coerce.number().finite().positive().max(100_000).multipleOf(0.01),
    unitPrice: moneySchema
  })).min(1).max(100)
});

const conversionFields = {
  scheduledStart: z.iso.datetime({ offset: true }).nullable().optional(),
  scheduledEnd: z.iso.datetime({ offset: true }).nullable().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  crewNotes: z.string().trim().max(5000).nullable().optional()
};

const validSchedule = (value: { scheduledStart?: string | null; scheduledEnd?: string | null }) =>
  !value.scheduledStart || !value.scheduledEnd || value.scheduledEnd > value.scheduledStart;

export const quoteConversionSchema = z.object(conversionFields).refine(validSchedule, {
  message: "Scheduled end must be after scheduled start.",
  path: ["scheduledEnd"]
});

export const serviceRequestConversionSchema = z.object({
  ...conversionFields,
  value: moneySchema.default(0)
}).refine(validSchedule, {
  message: "Scheduled end must be after scheduled start.",
  path: ["scheduledEnd"]
});

export const jobListSchema = paginationSchema.extend({
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "WAITING", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "number", "scheduledStart", "value"]).default("createdAt")
});

export const jobUpdateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "WAITING", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  scheduledStart: z.iso.datetime({ offset: true }).nullable().optional(),
  scheduledEnd: z.iso.datetime({ offset: true }).nullable().optional(),
  value: moneySchema.optional(),
  crewNotes: z.string().trim().max(5000).nullable().optional()
}).refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: "At least one field must be supplied."
}).refine((value) => !value.scheduledStart || !value.scheduledEnd || value.scheduledEnd > value.scheduledStart, {
  message: "Scheduled end must be after scheduled start.",
  path: ["scheduledEnd"]
});

export const serviceRequestUpdateSchema = z.object({
  status: z.enum(["NEW", "REVIEWING", "SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
  assignedToId: z.string().trim().min(1).nullable().optional(),
  internalNotes: z.string().trim().max(5000).nullable().optional()
}).refine((value) => Object.values(value).some((item) => item !== undefined), {
  message: "At least one field must be supplied."
});
