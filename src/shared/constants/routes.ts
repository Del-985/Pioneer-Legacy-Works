import type { BusinessSlug } from "../types/business";

export const ROUTES = {
  website: {
    home: "/",
    companies: "/companies",
    about: "/about",
    contact: "/contact"
  },

  divisions: {
    outdoorServices: {
      root: "/outdoor-services",
      services: "/outdoor-services/services",
      gallery: "/outdoor-services/gallery",
      quote: "/outdoor-services/quote",
      request: "/outdoor-services/request",
      contact: "/outdoor-services/contact",
      login: "/outdoor-services/login",
      register: "/outdoor-services/register",
      forgotPassword: "/outdoor-services/forgot-password",
      resetPassword: "/outdoor-services/reset-password",
      verifyEmail: "/outdoor-services/verify-email",
      account: "/outdoor-services/account"
    },

    transport: {
      root: "/transport",
      services: "/transport/services",
      quote: "/transport/quote",
      request: "/transport/request",
      contact: "/transport/contact"
    },

    productions: {
      root: "/productions",
      services: "/productions/services",
      portfolio: "/productions/portfolio",
      quote: "/productions/quote",
      request: "/productions/request",
      contact: "/productions/contact"
    }
  },

  admin: {
    root: "/admin",
    login: "/admin/login",
    overview: "/admin/overview",
    calendar: "/admin/calendar",
    customers: "/admin/customers",
    contacts: "/admin/contacts",
    estimates: "/admin/estimates",
    serviceRequests: "/admin/service-requests",
    jobs: "/admin/jobs",
    expenses: "/admin/expenses",
    forms: "/admin/forms",
    documents: "/admin/documents",
    history: "/admin/history",
    metrics: "/admin/metrics",
    notifications: "/admin/notifications",
    settings: "/admin/settings",
    businesses: "/admin/businesses"
  }
} as const;

export type AdminBusinessSection =
  | "overview"
  | "calendar"
  | "customers"
  | "estimates"
  | "jobs"
  | "expenses"
  | "equipment"
  | "forms"
  | "website";

export function adminBusinessRoute(
  business: BusinessSlug,
  section: AdminBusinessSection = "overview"
) {
  const root = `${ROUTES.admin.businesses}/${business}`;
  return section === "overview" ? root : `${root}/${section}`;
}

export type WebsiteRoute =
  (typeof ROUTES.website)[keyof typeof ROUTES.website];

export type AdminRoute =
  (typeof ROUTES.admin)[keyof typeof ROUTES.admin];

export type OutdoorServicesRoute =
  (typeof ROUTES.divisions.outdoorServices)[keyof typeof ROUTES.divisions.outdoorServices];

export type TransportRoute =
  (typeof ROUTES.divisions.transport)[keyof typeof ROUTES.divisions.transport];

export type ProductionsRoute =
  (typeof ROUTES.divisions.productions)[keyof typeof ROUTES.divisions.productions];
