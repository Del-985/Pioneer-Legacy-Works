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

async function createUser(role: "ADMIN" | "EMPLOYEE" | "CUSTOMER", email: string) {
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword("test-password"),
      firstName: role.charAt(0) + role.slice(1).toLowerCase(),
      lastName: "Tester",
      phone: "504-555-0100",
      role
    }
  });
  return {
    user,
    token: createAccessToken({ sub: user.id, email: user.email, role: user.role })
  };
}

async function seedIntake(email = "lead@example.com") {
  const customer = { firstName: "Jamie", lastName: "Rivera", email, phone: "504-555-0199" };
  const property = { streetAddress: "25 Oak Street", city: "New Orleans", state: "LA", postalCode: "70112" };
  const quote = await request(app).post("/api/public/quotes").send({ customer, property, serviceType: "Pressure Washing", description: "Clean the driveway and rear patio completely." });
  const serviceRequest = await request(app).post("/api/public/service-requests").send({ customer, property, serviceType: "Lawn Maintenance", description: "Mow and edge the front and back yards." });
  expect(quote.status).toBe(201);
  expect(serviceRequest.status).toBe(201);
  return { quoteId: quote.body.quote.id as string, serviceRequestId: serviceRequest.body.serviceRequest.id as string };
}

beforeEach(clearDatabase);
afterAll(async () => { await clearDatabase(); await prisma.$disconnect(); });

describe("admin intake authorization", () => {
  it("allows team members and rejects anonymous and customer users", async () => {
    const customer = await createUser("CUSTOMER", "customer-user@example.com");
    const employee = await createUser("EMPLOYEE", "employee@example.com");

    expect((await request(app).get("/api/admin/customers")).status).toBe(401);
    expect((await request(app).get("/api/admin/customers").set("Authorization", `Bearer ${customer.token}`)).status).toBe(403);
    expect((await request(app).get("/api/admin/customers").set("Authorization", `Bearer ${employee.token}`)).status).toBe(200);
  });
});

describe("admin intake operations", () => {
  it("filters and paginates customer records", async () => {
    const admin = await createUser("ADMIN", "admin@example.com");
    await seedIntake("jamie@example.com");
    await seedIntake("other@example.com");

    const response = await request(app)
      .get("/api/admin/customers?search=jamie%40example.com&page=1&pageSize=1&status=ACTIVE")
      .set("Authorization", `Bearer ${admin.token}`);

    expect(response.status).toBe(200);
    expect(response.body.pagination).toMatchObject({ page: 1, pageSize: 1, total: 1, totalPages: 1 });
    expect(response.body.data[0].email).toBe("jamie@example.com");
  });

  it("updates a quote assignment and status with an audit event", async () => {
    const admin = await createUser("ADMIN", "admin@example.com");
    const employee = await createUser("EMPLOYEE", "employee@example.com");
    const { quoteId } = await seedIntake();

    await request(app)
      .put(`/api/admin/quotes/${quoteId}/details`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({
        title: "Pressure Washing",
        expiresAt: "2030-12-31",
        discount: 0,
        taxRate: 0,
        items: [{ description: "Pressure washing service", quantity: 1, unitPrice: 250 }]
      });

    const response = await request(app)
      .patch(`/api/admin/quotes/${quoteId}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ status: "SENT", assignedToId: employee.user.id, internalNotes: "Call before visiting." });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ status: "SENT", assignedToId: employee.user.id, internalNotes: "Call before visiting." });
    const audit = await prisma.auditEvent.findFirst({ where: { entityType: "Quote", entityId: quoteId, action: "quote.updated" } });
    expect(audit).toMatchObject({ actorId: admin.user.id, action: "quote.updated" });
  });

  it("updates a service request and records the transition", async () => {
    const employee = await createUser("EMPLOYEE", "employee@example.com");
    const { serviceRequestId } = await seedIntake();

    const response = await request(app)
      .patch(`/api/admin/service-requests/${serviceRequestId}`)
      .set("Authorization", `Bearer ${employee.token}`)
      .send({ status: "REVIEWING", assignedToId: employee.user.id, internalNotes: "Confirm property access." });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("REVIEWING");
    const audit = await prisma.auditEvent.findFirst({ where: { entityType: "ServiceRequest", entityId: serviceRequestId } });
    expect(audit?.metadata).toMatchObject({ previousStatus: "NEW", status: "REVIEWING", internalNotesChanged: true });
  });
});
