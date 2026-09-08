import { Link, Navigate, useParams } from "react-router-dom";

import { getBusinessBySlug } from "../../shared/constants/businesses";
import {
  adminBusinessRoute,
  ROUTES,
  type AdminBusinessSection
} from "../../shared/constants/routes";
import type { BusinessSlug } from "../../shared/types/business";

interface SectionDefinition {
  id: AdminBusinessSection;
  label: string;
  description: string;
}

const sections: SectionDefinition[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Business-level scheduling, financial health, and immediate attention items."
  },
  {
    id: "calendar",
    label: "Schedule",
    description: "Jobs, appointments, availability, and scheduling conflicts for this business."
  },
  {
    id: "customers",
    label: "Customers",
    description: "Customer records and service history belonging only to this business."
  },
  {
    id: "estimates",
    label: "Estimates",
    description: "Quotes and estimates created for this business and its services."
  },
  {
    id: "jobs",
    label: "Jobs",
    description: "Active, upcoming, completed, and cancelled work for this business."
  },
  {
    id: "expenses",
    label: "Expenses",
    description: "Business-specific operating expenses and cost tracking."
  },
  {
    id: "equipment",
    label: "Equipment",
    description: "Vehicles, tools, production gear, and other assets assigned to this business."
  },
  {
    id: "forms",
    label: "Forms",
    description: "Downloadable forms, templates, and completed paperwork for this business."
  },
  {
    id: "website",
    label: "Website Settings",
    description: "Public-site content, contact details, service settings, and business presentation."
  }
];

const sectionIds = new Set<AdminBusinessSection>(
  sections.map((section) => section.id)
);

const metricPlaceholders = [
  {
    label: "Scheduled Work",
    value: "—",
    description: "Jobs and appointments in the current period"
  },
  {
    label: "Open Estimates",
    value: "—",
    description: "Quotes awaiting pricing, delivery, or customer response"
  },
  {
    label: "Estimated Revenue",
    value: "—",
    description: "Expected revenue from business-scoped work"
  },
  {
    label: "Expenses",
    value: "—",
    description: "Recorded operating costs for this business"
  }
];

function isBusinessSlug(value: string | undefined): value is BusinessSlug {
  return value === "landscaping" || value === "transport" || value === "productions";
}

function BusinessPanel() {
  const { businessSlug, section: sectionParam } = useParams();

  if (!isBusinessSlug(businessSlug)) {
    return <Navigate replace to={ROUTES.admin.overview} />;
  }

  const business = getBusinessBySlug(businessSlug);
  if (!business) {
    return <Navigate replace to={ROUTES.admin.overview} />;
  }

  const section =
    sectionParam && sectionIds.has(sectionParam as AdminBusinessSection)
      ? (sectionParam as AdminBusinessSection)
      : "overview";
  const selectedSection = sections.find((item) => item.id === section)!;
  const isOverview = section === "overview";

  return (
    <section className="business-admin-page">
      <header className="business-admin-hero">
        <div className="business-admin-hero__identity">
          <p className="business-admin-hero__eyebrow">Business Administration</p>
          <h2>{business.name}</h2>
          <p>{business.description}</p>
        </div>

        <div className="business-admin-hero__actions">
          <span
            className={
              business.status === "active"
                ? "business-admin-status business-admin-status--active"
                : "business-admin-status"
            }
          >
            {business.status === "active" ? "Active" : "Coming Soon"}
          </span>
          <Link to={business.route}>Open public site</Link>
        </div>
      </header>

      <nav className="business-admin-tabs" aria-label={`${business.shortName} administration`}>
        {sections.map((item) => (
          <Link
            key={item.id}
            className={
              item.id === section
                ? "business-admin-tabs__link business-admin-tabs__link--active"
                : "business-admin-tabs__link"
            }
            to={adminBusinessRoute(business.slug, item.id)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {isOverview ? (
        <>
          <section className="business-admin-metrics" aria-label="Business overview metrics">
            {metricPlaceholders.map((metric) => (
              <article className="business-admin-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.description}</p>
              </article>
            ))}
          </section>

          <div className="business-admin-grid">
            <section className="business-admin-card business-admin-card--wide">
              <div className="business-admin-card__heading">
                <div>
                  <p>Business Workspace</p>
                  <h3>Manage {business.shortName}</h3>
                </div>
              </div>

              <div className="business-admin-module-grid">
                {sections
                  .filter((item) => item.id !== "overview")
                  .map((item) => (
                    <Link
                      className="business-admin-module"
                      key={item.id}
                      to={adminBusinessRoute(business.slug, item.id)}
                    >
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                      <small>Open module →</small>
                    </Link>
                  ))}
              </div>
            </section>

            <aside className="business-admin-card">
              <div className="business-admin-card__heading">
                <div>
                  <p>Data Scope</p>
                  <h3>Business separation</h3>
                </div>
              </div>
              <p className="business-admin-card__copy">
                This workspace is reserved for {business.shortName} data. The
                backend still needs formal business IDs before live customer,
                job, quote, expense, and schedule records can be safely filtered
                into this panel.
              </p>
              <p className="business-admin-card__copy">
                Until that backend scope exists, the enterprise records remain
                in the enterprise-level modules instead of being duplicated or
                incorrectly assigned here.
              </p>
            </aside>
          </div>
        </>
      ) : (
        <section className="business-admin-section">
          <div className="business-admin-section__heading">
            <p>{business.shortName}</p>
            <h3>{selectedSection.label}</h3>
            <span>{selectedSection.description}</span>
          </div>

          <div className="business-admin-section__state">
            <strong>{selectedSection.label} is now business-scoped.</strong>
            <p>
              This section belongs only to {business.shortName}. Live records
              will connect here once the backend business/division model is in
              place, so one company's data cannot leak into another company's
              panel.
            </p>
          </div>
        </section>
      )}
    </section>
  );
}

export default BusinessPanel;
