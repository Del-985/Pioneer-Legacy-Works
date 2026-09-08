import type { ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { logout } from "../../services/api/auth";
import {
  availableBusinesses,
  getBusinessBySlug
} from "../../shared/constants/businesses";
import { adminBusinessRoute, ROUTES } from "../../shared/constants/routes";
import type { BusinessSlug } from "../../shared/types/business";

function getSelectedBusiness(pathname: string): BusinessSlug | "all" {
  const match = pathname.match(
    /^\/admin\/businesses\/(landscaping|transport|productions)(?:\/|$)/
  );
  return (match?.[1] as BusinessSlug | undefined) ?? "all";
}

function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedBusiness = getSelectedBusiness(location.pathname);
  const selectedDefinition =
    selectedBusiness === "all" ? undefined : getBusinessBySlug(selectedBusiness);

  const handleBusinessChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value as BusinessSlug | "all";
    navigate(
      value === "all" ? ROUTES.admin.overview : adminBusinessRoute(value)
    );
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.admin.login, { replace: true });
  };

  return (
    <header className="admin-header">
      <div className="admin-header__heading">
        <p className="admin-header__eyebrow">
          {selectedDefinition ? "Business Panel" : "Pioneer Legacy Works"}
        </p>

        <h1 className="admin-header__title">
          {selectedDefinition?.shortName ?? "Enterprise Administration"}
        </h1>
      </div>

      <div className="admin-header__actions">
        <label
          className="admin-header__business-selector"
          htmlFor="admin-business-selector"
        >
          <span>Panel</span>

          <select
            id="admin-business-selector"
            value={selectedBusiness}
            onChange={handleBusinessChange}
          >
            <option value="all">Enterprise / All Businesses</option>

            {availableBusinesses.map((business) => (
              <option key={business.id} value={business.slug}>
                {business.shortName}
              </option>
            ))}
          </select>
        </label>

        <button
          className="admin-header__notification-button"
          type="button"
          aria-label="Open notifications"
          onClick={() => navigate(ROUTES.admin.notifications)}
        >
          Notifications
          <span className="admin-header__notification-count">0</span>
        </button>

        <button
          className="admin-header__profile-button"
          type="button"
          aria-label="Sign out of the administrator account"
          onClick={handleLogout}
        >
          <span
            className="admin-header__profile-avatar"
            aria-hidden="true"
          >
            A
          </span>

          <span className="admin-header__profile-text">
            <strong>Administrator</strong>
            <small>Sign out</small>
          </span>
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
