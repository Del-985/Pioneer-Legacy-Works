import { NavLink } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";
import LandscapingNavigation from "./LandscapingNavigation";

function LandscapingHeader() {
  return (
    <header className="landscaping-app__header">
      <div className="container landscaping-app__header-inner">
        <NavLink className="landscaping-app__brand" to={ROUTES.divisions.landscaping.root}>
          <span className="landscaping-app__brand-mark" aria-hidden="true">P</span>
          <span>
            <strong>Pioneer Outdoor Services</strong>
            <small>Outdoor property care built around dependable service</small>
          </span>
        </NavLink>

        <LandscapingNavigation />

        <NavLink className="landscaping-app__account" to={ROUTES.divisions.landscaping.login}>
          Customer Login
        </NavLink>
      </div>
    </header>
  );
}

export default LandscapingHeader;
