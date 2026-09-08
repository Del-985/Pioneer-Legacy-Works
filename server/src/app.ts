import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { logEvent } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import {
  apiRateLimiter,
  authRateLimiter,
  publicSubmissionRateLimiter
} from "./middleware/rateLimiters.js";
import { requestContext } from "./middleware/requestContext.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import publicRoutes from "./routes/public.js";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(requestContext);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/api", apiRateLimiter);

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "pioneer-legacy-works-api" });
});

app.get("/ready", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: "ready", service: "pioneer-legacy-works-api" });
  } catch (error) {
    logEvent("error", "database_readiness_check_failed", {
      requestId: response.locals.requestId,
      errorName: error instanceof Error ? error.name : "UnknownError"
    });
    response.status(503).json({
      status: "unavailable",
      service: "pioneer-legacy-works-api",
      requestId: response.locals.requestId
    });
  }
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicSubmissionRateLimiter, publicRoutes);

app.use(notFound);
app.use(errorHandler);
