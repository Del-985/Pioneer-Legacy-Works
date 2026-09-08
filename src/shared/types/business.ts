export type BusinessSlug =
  | "landscaping"
  | "transport"
  | "productions";

export type BusinessStatus =
  | "active"
  | "coming-soon"
  | "inactive";

export type BusinessModule =
  | "scheduling"
  | "customers"
  | "contacts"
  | "estimates"
  | "jobs"
  | "expenses"
  | "equipment"
  | "forms"
  | "website"
  | "documents"
  | "history"
  | "metrics"
  | "notifications"
  | "search";

export interface BusinessTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface BusinessDefinition {
  id: string;
  slug: BusinessSlug;
  name: string;
  shortName: string;
  description: string;
  route: string;
  status: BusinessStatus;
  enabledModules: BusinessModule[];
  theme: BusinessTheme;
  logoPath?: string;
}
