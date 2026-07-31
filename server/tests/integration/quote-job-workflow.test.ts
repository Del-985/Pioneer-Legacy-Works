import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "../../src/app.js";
import { createAccessToken, hashPassword } from "../../src/lib/auth.js";
import { prisma } from "../../src/lib/prisma.js";

async function clearDatabase() {
  await prisma.$transaction([
    prisma.auditEvent.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.job.deleteMany(),
    prisma.quoteItem.deleteMany(),
    prisma.quote.deleteMany(),
    prisma.serviceRequest.deleteMany(),
    prisma.property.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.user.deleteMany()
  ]);
}

async function adminToken() {
  const user = await prisma.user.create({
    data: {
      email: "workflow-admin@example.com",
      passwordHash: await hashPassword("test-password"),
      firstName: "Workflow",
      lastName: "Admin",
      role: "ADMIN"
    }
  });
  return createAccessToken({ sub: user.id, email: user.email, role: user.role });
}

async function seedIntake() {
  const customer = { firstName: "Morgan", lastName: "Lee", email: "morgan@example.com", phone: "504-555-0144" };
  const property = { streetAddress: "88 River Road", city: "New Orleans", state: "LA", postalCode: "70118" };
  const quote = await request(app).post("/api/public/quotes").send({
    customer,
    property,
    serviceType: "Exterior restoration",
    description: "Restore the exterior surfaces and complete a final cleanup."
  });
  const serviceRequest = await request(app).post("/api/public/service-requests").send({
    customer,
    property,
    serviceType: "Property cleanup",
    description: "Remove the debris and prepare the property for maintenance."
  });
  return {
    quoteId: quote.body.quote.id as string,
    serviceRequestId: serviceRequest.body.serviceRequest.id as string
  };
}

beforeEach(clearDatabase);
afterAll(async () => { await clearDatabase(); await prisma.$disconnect(); });

describe("quote workflow", () => {
  it("owns line-item calculations on the server and generates a document", async () => {
    const token = await adminToken();
    const { quoteId } = await seedIntake();

    const response = await request(app)
      .put(`/api/admin/quotes/${quoteId}/details`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Exterior restoration",
        description: "Customer-facing scope",
        expiresAt: "2030-08-31",
        discount: 25,
        taxRate: 9.45,
        items: [
          { description: "Pressure washing", quantity: 2.5, unitPrice: 100 },
          { description: "Surface treatment", quantity: 1, unitPrice: 75.55 }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      subtotal: "325.55",
      discount: "25",
      taxRate: "9.45",
      tax: "28.40",
      total: "328.95"
    });
    expect(response.body.data.items).toHaveLength(2);

    const documentResponse = await request(app)
      .get(`/api/admin/quotes/${quoteId}/document`)
      .set("Authorization", `Bearer ${token}`);
    expect(documentResponse.status).toBe(200);
    expect(documentResponse.body.data.filename).toMatch(/^Q-\d{4}-[A-F0-9]{8}\.html$/);
    expect(documentResponse.body.data.content).toContain("Customer-facing scope");
    expect(documentResponse.body.data.content).toContain("$328.95");
  });

  it("requires a priced quote, records approval time, and converts exactly once", async () => {
    const token = await adminToken();
    const { quoteId } = await seedIntake();

    const earlyApproval = await request(app)
      .patch(`/api/admin/quotes/${quoteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "APPROVED" });
    expect(earlyApproval.status).toBe(409);

    await request(app)
      .put(`/api/admin/quotes/${quoteId}/details`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Exterior restoration",
        expiresAt: "2030-08-31",
        discount: 0,
        taxRate: 10,
        items: [{ description: "Complete work", quantity: 1, unitPrice: 500 }]
      });
    const approval = await request(app)
      .patch(`/api/admin/quotes/${quoteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "APPROVED" });
    expect(approval.status).toBe(200);
    expect(approval.body.data.approvedAt).toBeTruthy();

    const conversion = await request(app)
      .post(`/api/admin/quotes/${quoteId}/convert-to-job`)
      .set("Authorization", `Bearer ${token}`)
      .send({ priority: "high" });
    expect(conversion.status).toBe(201);
    expect(conversion.body.data.number).toMatch(/^JOB-\d{4}-\d{4}-[A-F0-9]{6}$/);
    expect(conversion.body.data).toMatchObject({ priority: "high", value: "550" });

    const duplicate = await request(app)
      .post(`/api/admin/quotes/${quoteId}/convert-to-job`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(duplicate.status).toBe(409);
    await expect(prisma.job.count({ where: { quoteId } })).resolves.toBe(1);
  });
});

describe("job operations", () => {
  it("converts service requests and persists job lifecycle details", async () => {
    const token = await adminToken();
    const { serviceRequestId } = await seedIntake();
    const conversion = await request(app)
      .post(`/api/admin/service-requests/${serviceRequestId}/convert-to-job`)
      .set("Authorization", `Bearer ${token}`)
      .send({ value: 425.25, priority: "urgent" });

    expect(conversion.status).toBe(201);
    expect(conversion.body.data).toMatchObject({ priority: "urgent", value: "425.25" });

    const update = await request(app)
      .patch(`/api/admin/jobs/${conversion.body.data.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "IN_PROGRESS", priority: "normal", crewNotes: "Gate code confirmed." });
    expect(update.status).toBe(200);
    expect(update.body.data).toMatchObject({
      status: "IN_PROGRESS",
      priority: "normal",
      crewNotes: "Gate code confirmed."
    });

    const listing = await request(app)
      .get("/api/admin/jobs?status=IN_PROGRESS&search=Morgan")
      .set("Authorization", `Bearer ${token}`);
    expect(listing.status).toBe(200);
    expect(listing.body.pagination.total).toBe(1);
    expect(listing.body.data[0].number).toBe(conversion.body.data.number);

    const auditActions = await prisma.auditEvent.findMany({ orderBy: { createdAt: "asc" }, select: { action: true } });
    expect(auditActions.map((event) => event.action)).toEqual([
      "service_request.converted_to_job",
      "job.updated"
    ]);
  });
});
