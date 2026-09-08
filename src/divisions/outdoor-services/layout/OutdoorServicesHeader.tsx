import { NavLink } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";
import OutdoorServicesNavigation from "./OutdoorServicesNavigation";

function OutdoorServicesHeader() {
  return (
    <header className="outdoor-services-app__header">
      <div className="container outdoor-services-app__header-inner">
        <NavLink className="outdoor-services-app__brand" to={ROUTES.divisions.outdoorServices.root}>
          <span className="outdoor-services-app__brand-mark" aria-hidden="true">P</span>
          <span>
            <strong>Pioneer Outdoor Services</strong>
            <small>Outdoor property care built around dependable service</small>
          </span>
        </NavLink>

        <OutdoorServicesNavigation />

        <NavLink className="outdoor-services-app__account" to={ROUTES.divisions.outdoorServices.login}>
          Customer Login
        </NavLink>
      </div>
    </header>
  );
}

export default OutdoorServicesHeader;
