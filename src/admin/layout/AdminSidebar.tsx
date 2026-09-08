import { NavLink, useLocation } from "react-router-dom";

import { availableBusinesses } from "../../shared/constants/businesses";
import {
  adminBusinessRoute,
  ROUTES,
  type AdminBusinessSection
} from "../../shared/constants/routes";
import type { BusinessSlug } from "../../shared/types/business";

const enterpriseNavigationItems = [
  { label: "Overview", path: ROUTES.admin.overview },
  { label: "Calendar", path: ROUTES.admin.calendar },
  { label: "Customers", path: ROUTES.admin.customers },
  { label: "Contacts", path: ROUTES.admin.contacts },
  { label: "Estimates", path: ROUTES.admin.estimates },
  { label: "Service Requests", path: ROUTES.admin.serviceRequests },
  { label: "Jobs", path: ROUTES.admin.jobs },
  { label: "Expenses", path: ROUTES.admin.expenses },
  { label: "Forms", path: ROUTES.admin.forms },
  { label: "History", path: ROUTES.admin.history },
  { label: "Metrics", path: ROUTES.admin.metrics },
  { label: "Notifications", path: ROUTES.admin.notifications },
  { label: "Settings", path: ROUTES.admin.settings }
];

const businessNavigationItems: Array<{
  label: string;
  section: AdminBusinessSection;
}> = [
  { label: "Overview", section: "overview" },
  { label: "Schedule", section: "calendar" },
  { label: "Customers", section: "customers" },
  { label: "Estimates", section: "estimates" },
  { label: "Jobs", section: "jobs" },
  { label: "Expenses", section: "expenses" },
  { label: "Equipment", section: "equipment" },
  { label: "Forms", section: "forms" },
  { label: "Website Settings", section: "website" }
];

function getSelectedBusiness(pathname: string): BusinessSlug | null {
  const match = pathname.match(
    /^\/admin\/businesses\/(landscaping|transport|productions)(?:\/|$)/
  );
  return (match?.[1] as BusinessSlug | undefined) ?? null;
}

function AdminSidebar() {
  const location = useLocation();
  const selectedBusiness = getSelectedBusiness(location.pathname);

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__brand-mark" aria-hidden="true">P</span>
        <div>
          <p className="admin-sidebar__brand-name">Pioneer Legacy Works</p>
          <p className="admin-sidebar__brand-subtitle">Administration</p>
        </div>
      </div>

      <nav className="admin-sidebar__navigation" aria-label="Admin navigation">
        <section className="admin-sidebar__group">
          <p className="admin-sidebar__group-label">Enterprise</p>
          <ul className="admin-sidebar__list">
            {enterpriseNavigationItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar__link admin-sidebar__link--active"
                      : "admin-sidebar__link"
                  }
                  to={item.path}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-sidebar__group">
          <p className="admin-sidebar__group-label">Businesses</p>
          <ul className="admin-sidebar__list">
            {availableBusinesses.map((business) => (
              <li key={business.id}>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar__link admin-sidebar__link--active"
                      : "admin-sidebar__link"
                  }
                  to={adminBusinessRoute(business.slug)}
                >
                  <span>{business.shortName}</span>
                  <small className="admin-sidebar__business-status">
                    {business.status === "active" ? "Active" : "Soon"}
                  </small>
                </NavLink>

                {selectedBusiness === business.slug ? (
                  <ul className="admin-sidebar__sublist">
                    {businessNavigationItems.map((item) => (
                      <li key={item.section}>
                        <NavLink
                          end={item.section === "overview"}
                          className={({ isActive }) =>
                            isActive
                              ? "admin-sidebar__sublink admin-sidebar__sublink--active"
                              : "admin-sidebar__sublink"
                          }
                          to={adminBusinessRoute(business.slug, item.section)}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </nav>

      <div className="admin-sidebar__footer">
        <NavLink className="admin-sidebar__website-link" to={ROUTES.website.home}>
          Return to Website
        </NavLink>
      </div>
    </aside>
  );
}

export default AdminSidebar;
