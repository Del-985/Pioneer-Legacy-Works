import "dotenv/config";
import { z } from "zod";

const optionalBootstrapSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(16).optional()
);

const optionalBooleanFlag = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.enum(["true", "false"]).transform((value) => value === "true").optional()
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  ENABLE_ADMIN_BOOTSTRAP: optionalBooleanFlag,
  ADMIN_BOOTSTRAP_SECRET: optionalBootstrapSecret
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid backend environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Backend environment validation failed");
}

export const env = {
  ...parsed.data,
  ENABLE_ADMIN_BOOTSTRAP:
    parsed.data.ENABLE_ADMIN_BOOTSTRAP ?? (parsed.data.NODE_ENV !== "production")
};
