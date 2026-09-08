import { apiRequest } from "./client";

export interface CustomerContactInput {
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phone: string;
}

export interface PropertyInput {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  accessNotes?: string;
}

export interface QuoteRequestInput {
  customer: CustomerContactInput;
  property: PropertyInput;
  serviceType: string;
  description: string;
  preferredTiming?: string;
}

export interface ServiceRequestInput {
  customer: CustomerContactInput;
  property: PropertyInput;
  serviceType: string;
  description: string;
  preferredDate?: string;
  preferredWindow?: string;
}

export function submitQuoteRequest(input: QuoteRequestInput) {
  return apiRequest<{
    quote: {
      id: string;
      number: string;
      status: string;
      createdAt: string;
    };
  }>("/api/public/quotes", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function submitServiceRequest(input: ServiceRequestInput) {
  return apiRequest<{
    serviceRequest: {
      id: string;
      status: string;
      createdAt: string;
    };
  }>("/api/public/service-requests", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
