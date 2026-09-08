import type { BusinessSlug } from "../types/business";

export const ROUTES = {
  website: {
    home: "/",
    companies: "/companies",
    about: "/about",
    contact: "/contact"
  },

  divisions: {
    landscaping: {
      root: "/landscaping",
      services: "/landscaping/services",
      gallery: "/landscaping/gallery",
      quote: "/landscaping/quote",
      request: "/landscaping/request",
      contact: "/landscaping/contact",
      login: "/landscaping/login",
      register: "/landscaping/register",
      forgotPassword: "/landscaping/forgot-password",
      resetPassword: "/landscaping/reset-password",
      verifyEmail: "/landscaping/verify-email",
      account: "/landscaping/account"
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

export type LandscapingRoute =
  (typeof ROUTES.divisions.landscaping)[keyof typeof ROUTES.divisions.landscaping];

export type TransportRoute =
  (typeof ROUTES.divisions.transport)[keyof typeof ROUTES.divisions.transport];

export type ProductionsRoute =
  (typeof ROUTES.divisions.productions)[keyof typeof ROUTES.divisions.productions];
