import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

import type { z } from "zod";
import type { quoteDetailsSchema } from "../schemas/admin.js";

export type QuoteDetailsInput = z.infer<typeof quoteDetailsSchema>;
type Transaction = Prisma.TransactionClient;

function toCents(value: number) {
  return Math.round((value + Number.EPSILON) * 100);
}

function fromCents(value: number) {
  return new Prisma.Decimal(value).dividedBy(100);
}

export function calculateQuoteTotals(input: Pick<QuoteDetailsInput, "items" | "discount" | "taxRate">) {
  const subtotalCents = input.items.reduce((sum, item) => {
    return sum + Math.round(item.quantity * toCents(item.unitPrice));
  }, 0);
  const discountCents = Math.min(toCents(input.discount), subtotalCents);
  const taxableCents = Math.max(subtotalCents - discountCents, 0);
  const taxCents = Math.round(taxableCents * input.taxRate / 100);

  return {
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    taxRate: new Prisma.Decimal(input.taxRate),
    tax: fromCents(taxCents),
    total: fromCents(taxableCents + taxCents)
  };
}

export async function replaceQuoteDetails(
  transaction: Transaction,
  quoteId: string,
  input: QuoteDetailsInput
) {
  const totals = calculateQuoteTotals(input);
  return transaction.quote.update({
    where: { id: quoteId },
    data: {
      title: input.title,
      description: input.description,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : input.expiresAt,
      ...totals,
      items: {
        deleteMany: {},
        create: input.items.map((item, sortOrder) => ({
          description: item.description,
          quantity: new Prisma.Decimal(item.quantity),
          unitPrice: new Prisma.Decimal(item.unitPrice),
          total: fromCents(Math.round(item.quantity * toCents(item.unitPrice))),
          sortOrder
        }))
      }
    }
  });
}

export async function expireStaleQuotes(prisma: PrismaClient) {
  await prisma.quote.updateMany({
    where: {
      status: "SENT",
      expiresAt: { lt: new Date() }
    },
    data: { status: "EXPIRED" }
  });
}

export function assertQuoteTransition(
  currentStatus: "DRAFT" | "SENT" | "APPROVED" | "DECLINED" | "EXPIRED",
  nextStatus: "DRAFT" | "SENT" | "APPROVED" | "DECLINED" | "EXPIRED"
) {
  if (currentStatus === nextStatus) return;
  type QuoteStatus = typeof currentStatus;
  const allowed: Record<QuoteStatus, QuoteStatus[]> = {
    DRAFT: ["SENT", "APPROVED", "DECLINED"],
    SENT: ["APPROVED", "DECLINED", "EXPIRED"],
    APPROVED: [],
    DECLINED: ["DRAFT"],
    EXPIRED: ["DRAFT"]
  };

  if (!allowed[currentStatus].includes(nextStatus)) {
    throw Object.assign(
      new Error(`Quote cannot move from ${currentStatus} to ${nextStatus}.`),
      { statusCode: 409 }
    );
  }
}

export function assertQuoteReadyForCustomer(quote: {
  items: Array<unknown>;
  total: Prisma.Decimal;
  expiresAt: Date | null;
}) {
  if (!quote.items.length || quote.total.lessThanOrEqualTo(0)) {
    throw Object.assign(new Error("Add at least one priced line item before sending or approving this quote."), { statusCode: 409 });
  }
  if (quote.expiresAt && quote.expiresAt.getTime() <= Date.now()) {
    throw Object.assign(new Error("Set a future expiration date before sending or approving this quote."), { statusCode: 409 });
  }
}
