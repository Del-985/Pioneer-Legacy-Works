import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

const allowedCategories = new Set(["customer", "operations", "finance", "internal"]);
const allowedScopes = new Set(["all", "outdoor-services", "transport", "productions"]);
const maxFileSizeBytes = 15 * 1024 * 1024;

const formFileSelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  businessScope: true,
  version: true,
  originalFilename: true,
  mimeType: true,
  sizeBytes: true,
  uploadedById: true,
  createdAt: true,
  updatedAt: true
} as const;

function getQueryString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function recordId(request: Request) {
  const id = request.params.id;
  if (!id || Array.isArray(id)) {
    throw Object.assign(new Error("A valid form ID is required."), { statusCode: 400 });
  }
  return id;
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[\r\n"\\/]/g, "_");
}

function isPdf(buffer: Buffer) {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

export async function listFormFiles(_request: Request, response: Response) {
  const data = await prisma.formFile.findMany({
    select: formFileSelect,
    orderBy: [{ category: "asc" }, { title: "asc" }, { createdAt: "desc" }]
  });

  response.json({ data });
}

export async function uploadFormFile(request: Request, response: Response) {
  const title = getQueryString(request.query.title);
  const description = getQueryString(request.query.description) || null;
  const category = getQueryString(request.query.category);
  const businessScope = getQueryString(request.query.businessScope) || "all";
  const version = getQueryString(request.query.version) || "1.0";
  const originalFilename = getQueryString(request.query.filename);
  const fileBuffer = Buffer.isBuffer(request.body) ? request.body : Buffer.alloc(0);

  if (!title) {
    response.status(400).json({ message: "Form name is required." });
    return;
  }
  if (!allowedCategories.has(category)) {
    response.status(400).json({ message: "Choose a valid form category." });
    return;
  }
  if (!allowedScopes.has(businessScope)) {
    response.status(400).json({ message: "Choose a valid business division." });
    return;
  }
  if (!originalFilename) {
    response.status(400).json({ message: "The original PDF filename is required." });
    return;
  }
  if (!fileBuffer.length) {
    response.status(400).json({ message: "Select a PDF to upload." });
    return;
  }
  if (fileBuffer.length > maxFileSizeBytes) {
    response.status(413).json({ message: "PDF files are limited to 15 MB." });
    return;
  }
  if (!isPdf(fileBuffer)) {
    response.status(400).json({ message: "Only valid PDF files can be stored in the forms library." });
    return;
  }

  const data = await prisma.formFile.create({
    data: {
      title,
      description,
      category,
      businessScope,
      version,
      originalFilename,
      mimeType: "application/pdf",
      sizeBytes: fileBuffer.length,
      content: Uint8Array.from(fileBuffer),
      uploadedById: request.auth?.sub ?? null
    },
    select: formFileSelect
  });

  await prisma.auditEvent.create({
    data: {
      actorId: request.auth?.sub ?? null,
      action: "FORM_FILE_UPLOADED",
      entityType: "FormFile",
      entityId: data.id,
      metadata: {
        title: data.title,
        category: data.category,
        businessScope: data.businessScope,
        version: data.version,
        originalFilename: data.originalFilename,
        sizeBytes: data.sizeBytes
      }
    }
  });

  response.status(201).json({ data });
}

export async function downloadFormFile(request: Request, response: Response) {
  const file = await prisma.formFile.findUnique({ where: { id: recordId(request) } });

  if (!file) {
    response.status(404).json({ message: "Stored form not found." });
    return;
  }

  const filename = sanitizeFilename(file.originalFilename || `${file.title}.pdf`);
  response.setHeader("Content-Type", file.mimeType || "application/pdf");
  response.setHeader("Content-Length", String(file.sizeBytes));
  response.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  response.setHeader("Cache-Control", "private, no-store");
  response.send(Buffer.from(file.content));
}

export async function deleteFormFile(request: Request, response: Response) {
  const file = await prisma.formFile.findUnique({
    where: { id: recordId(request) },
    select: formFileSelect
  });

  if (!file) {
    response.status(404).json({ message: "Stored form not found." });
    return;
  }

  await prisma.formFile.delete({ where: { id: file.id } });
  await prisma.auditEvent.create({
    data: {
      actorId: request.auth?.sub ?? null,
      action: "FORM_FILE_DELETED",
      entityType: "FormFile",
      entityId: file.id,
      metadata: {
        title: file.title,
        originalFilename: file.originalFilename
      }
    }
  });

  response.status(204).send();
}
