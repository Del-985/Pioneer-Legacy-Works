import { NavLink } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";

const navigationItems = [
  { label: "Home", path: ROUTES.divisions.outdoorServices.root, end: true },
  { label: "Services", path: ROUTES.divisions.outdoorServices.services },
  { label: "Gallery", path: ROUTES.divisions.outdoorServices.gallery },
  { label: "Request Service", path: ROUTES.divisions.outdoorServices.request },
  { label: "Contact", path: ROUTES.divisions.outdoorServices.contact }
];

function OutdoorServicesNavigation() {
  return (
    <nav className="outdoor-services-app__nav" aria-label="Outdoor services navigation">
      {navigationItems.map((item) => (
        <NavLink
          className={({ isActive }) =>
            isActive
              ? "outdoor-services-app__nav-link outdoor-services-app__nav-link--active"
              : "outdoor-services-app__nav-link"
          }
          end={item.end}
          key={item.path}
          to={item.path}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default OutdoorServicesNavigation;
