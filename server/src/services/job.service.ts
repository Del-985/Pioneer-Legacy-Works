import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

type Transaction = Prisma.TransactionClient;

export function createJobNumber(now = new Date()) {
  const year = now.getUTCFullYear();
  const day = now.toISOString().slice(5, 10).replace("-", "");
  return `JOB-${year}-${day}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function convertQuoteToJob(
  transaction: Transaction,
  quoteId: string,
  input: {
    scheduledStart?: string | null;
    scheduledEnd?: string | null;
    priority: string;
    crewNotes?: string | null;
  }
) {
  const quote = await transaction.quote.findUnique({
    where: { id: quoteId },
    include: { jobs: { take: 1 } }
  });
  if (!quote) throw Object.assign(new Error("Quote not found."), { statusCode: 404 });
  if (quote.jobs[0]) throw Object.assign(new Error("This quote has already been converted to a job."), { statusCode: 409 });
  if (quote.status !== "APPROVED") throw Object.assign(new Error("Only approved quotes can be converted to jobs."), { statusCode: 409 });

  return transaction.job.create({
    data: {
      number: createJobNumber(),
      customerId: quote.customerId,
      propertyId: quote.propertyId,
      quoteId: quote.id,
      title: quote.title,
      description: quote.description,
      priority: input.priority,
      scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : null,
      scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : null,
      value: quote.total,
      crewNotes: input.crewNotes
    }
  });
}

export async function convertServiceRequestToJob(
  transaction: Transaction,
  requestId: string,
  input: {
    scheduledStart?: string | null;
    scheduledEnd?: string | null;
    priority: string;
    crewNotes?: string | null;
    value: number;
  }
) {
  const serviceRequest = await transaction.serviceRequest.findUnique({
    where: { id: requestId },
    include: { jobs: { take: 1 } }
  });
  if (!serviceRequest) throw Object.assign(new Error("Service request not found."), { statusCode: 404 });
  if (serviceRequest.jobs[0]) throw Object.assign(new Error("This service request has already been converted to a job."), { statusCode: 409 });
  if (["COMPLETED", "CANCELLED"].includes(serviceRequest.status)) {
    throw Object.assign(new Error("Completed or cancelled service requests cannot be converted to jobs."), { statusCode: 409 });
  }

  const job = await transaction.job.create({
    data: {
      number: createJobNumber(),
      customerId: serviceRequest.customerId,
      propertyId: serviceRequest.propertyId,
      serviceRequestId: serviceRequest.id,
      title: serviceRequest.serviceType,
      description: serviceRequest.description,
      priority: input.priority,
      scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : serviceRequest.preferredDate,
      scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : null,
      value: new Prisma.Decimal(input.value),
      crewNotes: input.crewNotes
    }
  });
  await transaction.serviceRequest.update({
    where: { id: serviceRequest.id },
    data: { status: "SCHEDULED" }
  });
  return job;
}
