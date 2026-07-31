import type { NextFunction, Request, Response } from "express";
import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import {
  customerListSchema,
  quoteListSchema,
  quoteUpdateSchema,
  serviceRequestListSchema,
  serviceRequestUpdateSchema
} from "../schemas/admin.js";
import {
  assertQuoteReadyForCustomer,
  assertQuoteTransition,
  expireStaleQuotes
} from "../services/quote-workflow.service.js";

function pagination(page: number, pageSize: number, total: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}

function recordId(request: Request) {
  const id = request.params.id;
  if (!id || Array.isArray(id)) throw Object.assign(new Error("A valid record ID is required."), { statusCode: 400 });
  return id;
}

const customerSummaryInclude = {
  properties: { orderBy: { createdAt: "asc" as const }, take: 1 },
  quotes: { orderBy: { createdAt: "desc" as const }, take: 1, select: { createdAt: true } },
  serviceRequests: { orderBy: { createdAt: "desc" as const }, take: 1, select: { createdAt: true } },
  jobs: { orderBy: { createdAt: "desc" as const }, take: 1, select: { createdAt: true } },
  _count: { select: { quotes: true, serviceRequests: true, jobs: true, properties: true } }
};

const quoteInclude = {
  customer: true,
  property: true,
  assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
  items: { orderBy: { sortOrder: "asc" as const } },
  jobs: { select: { id: true, number: true, status: true } }
};

const serviceRequestInclude = {
  customer: true,
  property: true,
  assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
  jobs: { select: { id: true, number: true, status: true } }
};

async function validateAssignee(assignedToId: string | null | undefined) {
  if (!assignedToId) return;
  const user = await prisma.user.findFirst({
    where: { id: assignedToId, role: { in: ["ADMIN", "EMPLOYEE"] }, status: "ACTIVE" },
    select: { id: true }
  });
  if (!user) throw Object.assign(new Error("The selected assignee is not an active team member."), { statusCode: 400 });
}

export async function listAssignees(_request: Request, response: Response, next: NextFunction) {
  try {
    const data = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "EMPLOYEE"] }, status: "ACTIVE" },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: { id: true, firstName: true, lastName: true, email: true, role: true }
    });
    response.json({ data });
  } catch (error) { next(error); }
}

export async function listCustomers(request: Request, response: Response, next: NextFunction) {
  try {
    const query = customerListSchema.parse(request.query);
    const where: Prisma.CustomerWhereInput = {
      status: query.status,
      ...(query.search ? {
        OR: ["firstName", "lastName", "companyName", "email", "phone"].map((field) => ({
          [field]: { contains: query.search, mode: "insensitive" }
        }))
      } : {})
    };
    const [total, data] = await prisma.$transaction([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        include: customerSummaryInclude,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);
    response.json({ data, pagination: pagination(query.page, query.pageSize, total) });
  } catch (error) { next(error); }
}

export async function getCustomer(request: Request, response: Response, next: NextFunction) {
  try {
    const data = await prisma.customer.findUnique({
      where: { id: recordId(request) },
      include: {
        properties: { orderBy: { createdAt: "asc" } },
        quotes: { orderBy: { createdAt: "desc" }, take: 20, include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } } },
        serviceRequests: { orderBy: { createdAt: "desc" }, take: 20, include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } } },
        jobs: { orderBy: { createdAt: "desc" }, take: 20 },
        _count: { select: { quotes: true, serviceRequests: true, jobs: true, properties: true } }
      }
    });
    if (!data) { response.status(404).json({ message: "Customer not found." }); return; }
    response.json({ data });
  } catch (error) { next(error); }
}

export async function listQuotes(request: Request, response: Response, next: NextFunction) {
  try {
    await expireStaleQuotes(prisma);
    const query = quoteListSchema.parse(request.query);
    const where: Prisma.QuoteWhereInput = {
      status: query.status,
      assignedToId: query.assignedToId,
      ...(query.search ? { OR: [
        { number: { contains: query.search, mode: "insensitive" } },
        { title: { contains: query.search, mode: "insensitive" } },
        { customer: { is: { OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { companyName: { contains: query.search, mode: "insensitive" } }
        ] } } }
      ] } : {})
    };
    const [total, data] = await prisma.$transaction([
      prisma.quote.count({ where }),
      prisma.quote.findMany({ where, include: quoteInclude, orderBy: { [query.sortBy]: query.sortOrder }, skip: (query.page - 1) * query.pageSize, take: query.pageSize })
    ]);
    response.json({ data, pagination: pagination(query.page, query.pageSize, total) });
  } catch (error) { next(error); }
}

export async function getQuote(request: Request, response: Response, next: NextFunction) {
  try {
    await expireStaleQuotes(prisma);
    const data = await prisma.quote.findUnique({ where: { id: recordId(request) }, include: quoteInclude });
    if (!data) { response.status(404).json({ message: "Quote not found." }); return; }
    response.json({ data });
  } catch (error) { next(error); }
}

export async function updateQuote(request: Request, response: Response, next: NextFunction) {
  try {
    const input = quoteUpdateSchema.parse(request.body);
    await validateAssignee(input.assignedToId);
    const current = await prisma.quote.findUnique({
      where: { id: recordId(request) },
      select: {
        id: true,
        status: true,
        assignedToId: true,
        internalNotes: true,
        expiresAt: true,
        total: true,
        items: { select: { id: true } }
      }
    });
    if (!current) { response.status(404).json({ message: "Quote not found." }); return; }
    if (input.status) {
      assertQuoteTransition(current.status, input.status);
      if (["SENT", "APPROVED"].includes(input.status)) assertQuoteReadyForCustomer(current);
    }
    const data = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.quote.update({
        where: { id: current.id },
        data: {
          ...input,
          approvedAt: input.status === "APPROVED"
            ? new Date()
            : input.status === "DRAFT"
              ? null
              : undefined
        },
        include: quoteInclude
      });
      await transaction.auditEvent.create({ data: {
        actorId: request.auth!.sub,
        action: "quote.updated",
        entityType: "Quote",
        entityId: current.id,
        metadata: {
          previousStatus: current.status,
          status: updated.status,
          previousAssignedToId: current.assignedToId,
          assignedToId: updated.assignedToId,
          internalNotesChanged: current.internalNotes !== updated.internalNotes
        }
      } });
      return updated;
    });
    response.json({ data });
  } catch (error) { next(error); }
}

export async function listServiceRequests(request: Request, response: Response, next: NextFunction) {
  try {
    const query = serviceRequestListSchema.parse(request.query);
    const where: Prisma.ServiceRequestWhereInput = {
      status: query.status,
      assignedToId: query.assignedToId,
      ...(query.search ? { OR: [
        { serviceType: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { customer: { is: { OR: [
          { firstName: { contains: query.search, mode: "insensitive" } },
          { lastName: { contains: query.search, mode: "insensitive" } },
          { companyName: { contains: query.search, mode: "insensitive" } }
        ] } } }
      ] } : {})
    };
    const [total, data] = await prisma.$transaction([
      prisma.serviceRequest.count({ where }),
      prisma.serviceRequest.findMany({ where, include: serviceRequestInclude, orderBy: { [query.sortBy]: query.sortOrder }, skip: (query.page - 1) * query.pageSize, take: query.pageSize })
    ]);
    response.json({ data, pagination: pagination(query.page, query.pageSize, total) });
  } catch (error) { next(error); }
}

export async function getServiceRequest(request: Request, response: Response, next: NextFunction) {
  try {
    const data = await prisma.serviceRequest.findUnique({ where: { id: recordId(request) }, include: serviceRequestInclude });
    if (!data) { response.status(404).json({ message: "Service request not found." }); return; }
    response.json({ data });
  } catch (error) { next(error); }
}

export async function updateServiceRequest(request: Request, response: Response, next: NextFunction) {
  try {
    const input = serviceRequestUpdateSchema.parse(request.body);
    await validateAssignee(input.assignedToId);
    const current = await prisma.serviceRequest.findUnique({ where: { id: recordId(request) }, select: { id: true, status: true, assignedToId: true, internalNotes: true } });
    if (!current) { response.status(404).json({ message: "Service request not found." }); return; }
    const data = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.serviceRequest.update({ where: { id: current.id }, data: input, include: serviceRequestInclude });
      await transaction.auditEvent.create({ data: {
        actorId: request.auth!.sub,
        action: "service_request.updated",
        entityType: "ServiceRequest",
        entityId: current.id,
        metadata: {
          previousStatus: current.status,
          status: updated.status,
          previousAssignedToId: current.assignedToId,
          assignedToId: updated.assignedToId,
          internalNotesChanged: current.internalNotes !== updated.internalNotes
        }
      } });
      return updated;
    });
    response.json({ data });
  } catch (error) { next(error); }
}
