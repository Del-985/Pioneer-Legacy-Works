import { NavLink } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";

function LandscapingFooter() {
  return (
    <footer className="landscaping-app__footer">
      <div className="container landscaping-app__footer-inner">
        <div>
          <strong>Pioneer Outdoor Services</strong>
          <p>Residential and commercial outdoor property services.</p>
        </div>
        <div className="landscaping-app__footer-links">
          <NavLink to={ROUTES.divisions.landscaping.request}>Request Service</NavLink>
          <NavLink to={ROUTES.divisions.landscaping.contact}>Contact</NavLink>
          <NavLink to={ROUTES.website.home}>Pioneer Legacy Works</NavLink>
        </div>
      </div>
    </footer>
  );
}

export default LandscapingFooter;
