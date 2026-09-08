export type FormCategory =
  | "customer"
  | "operations"
  | "finance"
  | "internal";

export type FormAvailability = "available" | "planned";

export interface FormDefinition {
  id: string;
  title: string;
  description: string;
  path: string;
  category: FormCategory;
  availability: FormAvailability;
  businessScope: "all" | "outdoor-services" | "transport" | "productions";
}
