import type { BusinessSlug } from "./business";

export type DashboardWidgetType =
  | "today-snapshot"
  | "metrics"
  | "quick-forms"
  | "upcoming-jobs"
  | "weekly-snapshot"
  | "open-estimates"
  | "outstanding-expenses"
  | "notifications"
  | "recent-activity"
  | "business-health";

export type DashboardWidgetSize = "small" | "medium" | "large" | "tall";

export type WeeklySnapshotSectionId =
  | "jobs"
  | "estimates"
  | "revenue"
  | "expenses"
  | "customers"
  | "notifications"
  | "safety"
  | "upcoming"
  | "outdoor-services"
  | "transport"
  | "productions"
  | "inventory";

export interface DashboardWidgetSettings {
  title?: string;
  business: "all" | BusinessSlug;
  period: "today" | "week" | "month";
  limit: number;
  selectedFormIds?: string[];
  selectedWeeklySectionIds?: WeeklySnapshotSectionId[];
}

export interface DashboardWidgetInstance {
  instanceId: string;
  type: DashboardWidgetType;
  size: DashboardWidgetSize;
  settings: DashboardWidgetSettings;
}

export interface DashboardWidgetDefinition {
  type: DashboardWidgetType;
  title: string;
  description: string;
  defaultSize: DashboardWidgetSize;
}
