import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "../../src/app.js";
import { prisma } from "../../src/lib/prisma.js";

async function clearDatabase() {
  await prisma.$transaction([
    prisma.formFile.deleteMany(),
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

beforeEach(clearDatabase);
afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

describe("first administrator bootstrap", () => {
  it("creates exactly one administrator and leaves normal registration customer-only", async () => {
    const initialStatus = await request(app).get("/api/auth/bootstrap-admin/status");

    expect(initialStatus.status).toBe(200);
    expect(initialStatus.body).toMatchObject({
      enabled: true,
      configured: true,
      available: true,
      adminExists: false
    });

    const bootstrapResponse = await request(app)
      .post("/api/auth/bootstrap-admin")
      .send({
        firstName: "Pioneer",
        lastName: "Admin",
        email: "admin@example.com",
        password: "temporary-admin-password"
      });

    expect(bootstrapResponse.status).toBe(201);
    expect(bootstrapResponse.body.user).toMatchObject({
      email: "admin@example.com",
      role: "ADMIN"
    });
    expect(bootstrapResponse.body.token).toEqual(expect.any(String));
    expect(await prisma.user.count({ where: { role: "ADMIN" } })).toBe(1);

    const unavailableStatus = await request(app).get("/api/auth/bootstrap-admin/status");
    expect(unavailableStatus.body).toMatchObject({
      enabled: true,
      configured: true,
      available: false,
      adminExists: true
    });

    const secondBootstrap = await request(app)
      .post("/api/auth/bootstrap-admin")
      .send({
        firstName: "Second",
        lastName: "Admin",
        email: "second-admin@example.com",
        password: "another-admin-password"
      });

    expect(secondBootstrap.status).toBe(409);
    expect(await prisma.user.count({ where: { role: "ADMIN" } })).toBe(1);

    const customerRegistration = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "Regular",
        lastName: "Customer",
        email: "customer@example.com",
        phone: "419-555-0100",
        password: "customer-password"
      });

    expect(customerRegistration.status).toBe(201);
    expect(customerRegistration.body.user.role).toBe("CUSTOMER");
  });
});
