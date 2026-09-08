import { useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../../services/api/auth";
import { availableBusinesses } from "../../shared/constants/businesses";
import { ROUTES } from "../../shared/constants/routes";
import type { BusinessSlug } from "../../shared/types/business";

function AdminHeader() {
  const navigate = useNavigate();
  const [selectedBusiness, setSelectedBusiness] = useState<
    BusinessSlug | "all"
  >("all");

  const handleBusinessChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedBusiness(
      event.target.value as BusinessSlug | "all"
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
          Pioneer Legacy Works
        </p>

        <h1 className="admin-header__title">Administration</h1>
      </div>

      <div className="admin-header__actions">
        <label
          className="admin-header__business-selector"
          htmlFor="admin-business-selector"
        >
          <span>Business</span>

          <select
            id="admin-business-selector"
            value={selectedBusiness}
            onChange={handleBusinessChange}
          >
            <option value="all">All Businesses</option>

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
