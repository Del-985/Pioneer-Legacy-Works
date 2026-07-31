import type { NextFunction, Request, Response } from "express";
import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import {
  jobListSchema,
  jobUpdateSchema,
  quoteConversionSchema,
  quoteDetailsSchema,
  serviceRequestConversionSchema
} from "../schemas/admin.js";
import { convertQuoteToJob, convertServiceRequestToJob } from "../services/job.service.js";
import { replaceQuoteDetails } from "../services/quote-workflow.service.js";

const jobInclude = {
  customer: true,
  property: true,
  quote: { select: { id: true, number: true, title: true } },
  serviceRequest: { select: { id: true, serviceType: true } }
};

function recordId(request: Request) {
  const id = request.params.id;
  if (!id || Array.isArray(id)) throw Object.assign(new Error("A valid record ID is required."), { statusCode: 400 });
  return id;
}

function pageInfo(page: number, pageSize: number, total: number) {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function updateQuoteDetails(request: Request, response: Response, next: NextFunction) {
  try {
    const id = recordId(request);
    const input = quoteDetailsSchema.parse(request.body);
    const current = await prisma.quote.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!current) { response.status(404).json({ message: "Quote not found." }); return; }
    if (!["DRAFT", "SENT"].includes(current.status)) {
      response.status(409).json({ message: "Approved, declined, or expired quotes must return to draft before editing." });
      return;
    }

    const data = await prisma.$transaction(async (transaction) => {
      await replaceQuoteDetails(transaction, id, input);
      await transaction.auditEvent.create({
        data: {
          actorId: request.auth!.sub,
          action: "quote.details_updated",
          entityType: "Quote",
          entityId: id,
          metadata: { itemCount: input.items.length }
        }
      });
      return transaction.quote.findUniqueOrThrow({
        where: { id },
        include: {
          customer: true,
          property: true,
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: { orderBy: { sortOrder: "asc" } },
          jobs: { select: { id: true, number: true, status: true } }
        }
      });
    });
    response.json({ data });
  } catch (error) { next(error); }
}

export async function convertQuote(request: Request, response: Response, next: NextFunction) {
  try {
    const quoteId = recordId(request);
    const input = quoteConversionSchema.parse(request.body);
    const data = await prisma.$transaction(async (transaction) => {
      const job = await convertQuoteToJob(transaction, quoteId, input);
      await transaction.auditEvent.create({
        data: {
          actorId: request.auth!.sub,
          action: "quote.converted_to_job",
          entityType: "Quote",
          entityId: quoteId,
          metadata: { jobId: job.id, jobNumber: job.number }
        }
      });
      return transaction.job.findUniqueOrThrow({ where: { id: job.id }, include: jobInclude });
    }, { isolationLevel: "Serializable" });
    response.status(201).json({ data });
  } catch (error) { next(error); }
}

export async function convertServiceRequest(request: Request, response: Response, next: NextFunction) {
  try {
    const serviceRequestId = recordId(request);
    const input = serviceRequestConversionSchema.parse(request.body);
    const data = await prisma.$transaction(async (transaction) => {
      const job = await convertServiceRequestToJob(transaction, serviceRequestId, input);
      await transaction.auditEvent.create({
        data: {
          actorId: request.auth!.sub,
          action: "service_request.converted_to_job",
          entityType: "ServiceRequest",
          entityId: serviceRequestId,
          metadata: { jobId: job.id, jobNumber: job.number }
        }
      });
      return transaction.job.findUniqueOrThrow({ where: { id: job.id }, include: jobInclude });
    }, { isolationLevel: "Serializable" });
    response.status(201).json({ data });
  } catch (error) { next(error); }
}

export async function listJobs(request: Request, response: Response, next: NextFunction) {
  try {
    const query = jobListSchema.parse(request.query);
    const where: Prisma.JobWhereInput = {
      status: query.status,
      priority: query.priority,
      ...(query.search ? {
        OR: [
          { number: { contains: query.search, mode: "insensitive" } },
          { title: { contains: query.search, mode: "insensitive" } },
          { customer: { is: { OR: [
            { firstName: { contains: query.search, mode: "insensitive" } },
            { lastName: { contains: query.search, mode: "insensitive" } },
            { companyName: { contains: query.search, mode: "insensitive" } }
          ] } } }
        ]
      } : {})
    };
    const [total, data] = await prisma.$transaction([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        include: jobInclude,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);
    response.json({ data, pagination: pageInfo(query.page, query.pageSize, total) });
  } catch (error) { next(error); }
}

export async function getJob(request: Request, response: Response, next: NextFunction) {
  try {
    const data = await prisma.job.findUnique({ where: { id: recordId(request) }, include: jobInclude });
    if (!data) { response.status(404).json({ message: "Job not found." }); return; }
    response.json({ data });
  } catch (error) { next(error); }
}

export async function updateJob(request: Request, response: Response, next: NextFunction) {
  try {
    const id = recordId(request);
    const input = jobUpdateSchema.parse(request.body);
    const current = await prisma.job.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!current) { response.status(404).json({ message: "Job not found." }); return; }
    const data = await prisma.$transaction(async (transaction) => {
      const updated = await transaction.job.update({
        where: { id },
        data: {
          ...input,
          scheduledStart: input.scheduledStart === undefined ? undefined : input.scheduledStart ? new Date(input.scheduledStart) : null,
          scheduledEnd: input.scheduledEnd === undefined ? undefined : input.scheduledEnd ? new Date(input.scheduledEnd) : null
        },
        include: jobInclude
      });
      await transaction.auditEvent.create({
        data: {
          actorId: request.auth!.sub,
          action: "job.updated",
          entityType: "Job",
          entityId: id,
          metadata: { previousStatus: current.status, status: updated.status }
        }
      });
      return updated;
    });
    response.json({ data });
  } catch (error) { next(error); }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]!);
}

function currency(value: unknown) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export async function getQuoteDocument(request: Request, response: Response, next: NextFunction) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: recordId(request) },
      include: { customer: true, property: true, items: { orderBy: { sortOrder: "asc" } } }
    });
    if (!quote) { response.status(404).json({ message: "Quote not found." }); return; }
    const customerName = quote.customer.companyName || `${quote.customer.firstName} ${quote.customer.lastName}`;
    const address = quote.property
      ? `${quote.property.streetAddress}, ${quote.property.city}, ${quote.property.state} ${quote.property.postalCode}`
      : "";
    const rows = quote.items.map((item) => `
      <tr><td>${escapeHtml(item.description)}</td><td>${item.quantity}</td><td>${currency(item.unitPrice)}</td><td>${currency(item.total)}</td></tr>
    `).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(quote.number)}</title><style>
      body{font:15px Arial,sans-serif;color:#17221b;max-width:850px;margin:40px auto;padding:0 28px}header{display:flex;justify-content:space-between;border-bottom:3px solid #315d42;padding-bottom:20px}h1{color:#315d42;margin:0}table{width:100%;border-collapse:collapse;margin:30px 0}th,td{text-align:left;padding:12px;border-bottom:1px solid #d9e1dc}th{background:#eef4f0}.totals{margin-left:auto;width:320px}.totals div{display:flex;justify-content:space-between;padding:7px}.grand{font-size:20px;font-weight:bold;border-top:2px solid #315d42}.muted{color:#607066}@media print{body{margin:0}}</style></head>
      <body><header><div><h1>Pioneer Enterprises</h1><p>Customer Quote</p></div><div><strong>${escapeHtml(quote.number)}</strong><p>Status: ${quote.status}</p></div></header>
      <section><h2>${escapeHtml(quote.title)}</h2><p><strong>Prepared for:</strong> ${escapeHtml(customerName)}</p><p>${escapeHtml(address)}</p>${quote.description ? `<p>${escapeHtml(quote.description)}</p>` : ""}</section>
      <table><thead><tr><th>Description</th><th>Quantity</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="totals"><div><span>Subtotal</span><strong>${currency(quote.subtotal)}</strong></div><div><span>Discount</span><strong>-${currency(quote.discount)}</strong></div><div><span>Tax (${quote.taxRate}%)</span><strong>${currency(quote.tax)}</strong></div><div class="grand"><span>Total</span><strong>${currency(quote.total)}</strong></div></div>
      <p class="muted">Expires: ${quote.expiresAt ? quote.expiresAt.toLocaleDateString("en-US", { timeZone: "UTC" }) : "No expiration date"}</p></body></html>`;
    response.json({
      data: {
        filename: `${quote.number}.html`,
        contentType: "text/html;charset=utf-8",
        content: html
      }
    });
  } catch (error) { next(error); }
}
