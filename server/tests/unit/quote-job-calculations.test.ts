import { describe, expect, it } from "vitest";

import { createJobNumber } from "../../src/services/job.service.js";
import { calculateQuoteTotals } from "../../src/services/quote-workflow.service.js";

describe("quote totals", () => {
  it("rounds fractional quantities and tax to cents", () => {
    const totals = calculateQuoteTotals({
      discount: 25,
      taxRate: 9.45,
      items: [
        { description: "Pressure washing", quantity: 2.5, unitPrice: 100 },
        { description: "Surface treatment", quantity: 1, unitPrice: 75.55 }
      ]
    });

    expect(totals.subtotal.toFixed(2)).toBe("325.55");
    expect(totals.discount.toFixed(2)).toBe("25.00");
    expect(totals.tax.toFixed(2)).toBe("28.40");
    expect(totals.total.toFixed(2)).toBe("328.95");
  });

  it("caps discounts at the subtotal and never returns a negative total", () => {
    const totals = calculateQuoteTotals({
      discount: 500,
      taxRate: 10,
      items: [{ description: "Service", quantity: 1, unitPrice: 100 }]
    });

    expect(totals.discount.toFixed(2)).toBe("100.00");
    expect(totals.tax.toFixed(2)).toBe("0.00");
    expect(totals.total.toFixed(2)).toBe("0.00");
  });
});

describe("job numbers", () => {
  it("are human-readable and collision-resistant", () => {
    const number = createJobNumber(new Date("2026-07-22T12:00:00Z"));
    expect(number).toMatch(/^JOB-2026-0722-[A-F0-9]{6}$/);
  });
});
