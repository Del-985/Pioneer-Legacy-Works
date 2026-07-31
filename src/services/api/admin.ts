import { apiRequest } from "./client";

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: "ADMIN" | "EMPLOYEE";
}

export interface AdminProperty {
  id: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  accessNotes?: string | null;
}

export interface AdminCustomer {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string | null;
  email: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  properties: AdminProperty[];
  quotes: Array<{ id?: string; number?: string; title?: string; status?: string; createdAt: string }>;
  serviceRequests: Array<{ id?: string; serviceType?: string; status?: string; createdAt: string }>;
  jobs: Array<{ id?: string; number?: string; title?: string; status?: string; createdAt: string }>;
  _count: { quotes: number; serviceRequests: number; jobs: number; properties: number };
}

export interface AdminQuote {
  id: string;
  number: string;
  status: "DRAFT" | "SENT" | "APPROVED" | "DECLINED" | "EXPIRED";
  title: string;
  description?: string | null;
  subtotal: string | number;
  discount: string | number;
  taxRate: string | number;
  tax: string | number;
  total: string | number;
  expiresAt?: string | null;
  internalNotes?: string | null;
  assignedToId?: string | null;
  assignedTo?: TeamMember | null;
  customer: AdminCustomer;
  property?: AdminProperty | null;
  items: Array<{ id: string; description: string; quantity: string | number; unitPrice: string | number; total: string | number }>;
  jobs: Array<{ id: string; number: string; status: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminServiceRequest {
  id: string;
  status: "NEW" | "REVIEWING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  serviceType: string;
  description: string;
  preferredDate?: string | null;
  preferredWindow?: string | null;
  source: string;
  internalNotes?: string | null;
  assignedToId?: string | null;
  assignedTo?: TeamMember | null;
  customer: AdminCustomer;
  property?: AdminProperty | null;
  jobs: Array<{ id: string; number: string; status: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminJob {
  id: string;
  number: string;
  title: string;
  description?: string | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "WAITING" | "COMPLETED" | "CANCELLED";
  priority: "low" | "normal" | "high" | "urgent";
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  value: string | number;
  crewNotes?: string | null;
  customer: AdminCustomer;
  property?: AdminProperty | null;
  quote?: { id: string; number: string; title: string } | null;
  serviceRequest?: { id: string; serviceType: string } | null;
  createdAt: string;
  updatedAt: string;
}

type ListResponse<T> = { data: T[]; pagination: Pagination };

function queryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const encoded = query.toString();
  return encoded ? `?${encoded}` : "";
}

export function listAdminCustomers(params: Record<string, string | number | undefined>) {
  return apiRequest<ListResponse<AdminCustomer>>(`/api/admin/customers${queryString(params)}`);
}

export function getAdminCustomer(id: string) {
  return apiRequest<{ data: AdminCustomer }>(`/api/admin/customers/${id}`);
}

export function listAdminQuotes(params: Record<string, string | number | undefined>) {
  return apiRequest<ListResponse<AdminQuote>>(`/api/admin/quotes${queryString(params)}`);
}

export function updateAdminQuote(id: string, input: { status?: AdminQuote["status"]; assignedToId?: string | null; internalNotes?: string | null }) {
  return apiRequest<{ data: AdminQuote }>(`/api/admin/quotes/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function updateAdminQuoteDetails(id: string, input: {
  title: string;
  description?: string | null;
  expiresAt?: string | null;
  discount: number;
  taxRate: number;
  items: Array<{ id?: string; description: string; quantity: number; unitPrice: number }>;
}) {
  return apiRequest<{ data: AdminQuote }>(`/api/admin/quotes/${id}/details`, { method: "PUT", body: JSON.stringify(input) });
}

export function convertAdminQuoteToJob(id: string, input: {
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  priority?: AdminJob["priority"];
  crewNotes?: string | null;
} = {}) {
  return apiRequest<{ data: AdminJob }>(`/api/admin/quotes/${id}/convert-to-job`, { method: "POST", body: JSON.stringify(input) });
}

export function getAdminQuoteDocument(id: string) {
  return apiRequest<{ data: { filename: string; contentType: string; content: string } }>(`/api/admin/quotes/${id}/document`);
}

export function listAdminServiceRequests(params: Record<string, string | number | undefined>) {
  return apiRequest<ListResponse<AdminServiceRequest>>(`/api/admin/service-requests${queryString(params)}`);
}

export function updateAdminServiceRequest(id: string, input: { status?: AdminServiceRequest["status"]; assignedToId?: string | null; internalNotes?: string | null }) {
  return apiRequest<{ data: AdminServiceRequest }>(`/api/admin/service-requests/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function convertAdminServiceRequestToJob(id: string, input: {
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  priority?: AdminJob["priority"];
  crewNotes?: string | null;
  value?: number;
} = {}) {
  return apiRequest<{ data: AdminJob }>(`/api/admin/service-requests/${id}/convert-to-job`, { method: "POST", body: JSON.stringify(input) });
}

export function listAdminJobs(params: Record<string, string | number | undefined>) {
  return apiRequest<ListResponse<AdminJob>>(`/api/admin/jobs${queryString(params)}`);
}

export function updateAdminJob(id: string, input: Partial<Pick<AdminJob, "title" | "description" | "status" | "priority" | "scheduledStart" | "scheduledEnd" | "crewNotes">> & { value?: number }) {
  return apiRequest<{ data: AdminJob }>(`/api/admin/jobs/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function listAdminAssignees() {
  return apiRequest<{ data: TeamMember[] }>("/api/admin/assignees");
}
