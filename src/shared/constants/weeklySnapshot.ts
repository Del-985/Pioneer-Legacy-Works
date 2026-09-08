import type { WeeklySnapshotSectionId } from "../types/dashboard";

export interface WeeklySnapshotSectionDefinition {
  id: WeeklySnapshotSectionId;
  title: string;
  description: string;
}

export const weeklySnapshotSections: WeeklySnapshotSectionDefinition[] = [
  { id: "jobs", title: "Jobs", description: "Completed, active, waiting, and scheduled work." },
  { id: "estimates", title: "Estimates", description: "Sent, approved, declined, and conversion activity." },
  { id: "revenue", title: "Revenue", description: "Earned and outstanding revenue for the selected period." },
  { id: "expenses", title: "Expenses", description: "Total spending and large or pending expenses." },
  { id: "customers", title: "Customers", description: "New, returning, and active customers." },
  { id: "notifications", title: "Notifications", description: "Unread, urgent, and archived notification activity." },
  { id: "safety", title: "Safety", description: "Incidents, safety issues, and inspection status." },
  { id: "upcoming", title: "Upcoming", description: "Jobs and appointments scheduled for the next period." },
  { id: "outdoor-services", title: "Landscaping", description: "Property-service activity and performance." },
  { id: "transport", title: "Transport", description: "Deliveries, mileage, delays, and fleet activity." },
  { id: "productions", title: "Productions", description: "Projects, bookings, deliveries, and equipment activity." },
  { id: "inventory", title: "Inventory", description: "Low-stock items, assigned equipment, and maintenance needs." }
];

export const defaultWeeklySnapshotSectionIds: WeeklySnapshotSectionId[] = [
  "jobs",
  "estimates",
  "revenue",
  "expenses",
  "customers",
  "upcoming"
];
