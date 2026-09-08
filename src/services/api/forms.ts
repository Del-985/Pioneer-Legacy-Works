import { apiConfig, apiRequest, getAccessToken } from "./client";

export type StoredFormCategory = "customer" | "operations" | "finance" | "internal";
export type StoredFormScope = "all" | "outdoor-services" | "transport" | "productions";

export interface StoredFormFile {
  id: string;
  title: string;
  description?: string | null;
  category: StoredFormCategory;
  businessScope: StoredFormScope;
  version: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UploadStoredFormInput {
  title: string;
  description?: string;
  category: StoredFormCategory;
  businessScope: StoredFormScope;
  version?: string;
  file: File;
}

export function listStoredForms() {
  return apiRequest<{ data: StoredFormFile[] }>("/api/admin/form-files");
}

export function uploadStoredForm(input: UploadStoredFormInput) {
  const query = new URLSearchParams({
    title: input.title,
    category: input.category,
    businessScope: input.businessScope,
    version: input.version || "1.0",
    filename: input.file.name
  });

  if (input.description?.trim()) query.set("description", input.description.trim());

  return apiRequest<{ data: StoredFormFile }>(`/api/admin/form-files?${query.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: input.file
  });
}

export async function fetchStoredFormBlob(id: string) {
  const token = getAccessToken();
  const response = await fetch(`${apiConfig.baseUrl}/api/admin/form-files/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  if (!response.ok) {
    let message = "Unable to open the stored form.";
    if (response.headers.get("content-type")?.includes("application/json")) {
      const body = await response.json();
      message = body?.message ?? message;
    }
    throw new Error(message);
  }

  return response.blob();
}

export function deleteStoredForm(id: string) {
  return apiRequest<void>(`/api/admin/form-files/${id}`, { method: "DELETE" });
}
