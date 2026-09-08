import { NavLink } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";

function OutdoorServicesFooter() {
  return (
    <footer className="outdoor-services-app__footer">
      <div className="container outdoor-services-app__footer-inner">
        <div>
          <strong>Pioneer Outdoor Services</strong>
          <p>Residential and commercial outdoor property services.</p>
        </div>
        <div className="outdoor-services-app__footer-links">
          <NavLink to={ROUTES.divisions.outdoorServices.request}>Request Service</NavLink>
          <NavLink to={ROUTES.divisions.outdoorServices.contact}>Contact</NavLink>
          <NavLink to={ROUTES.website.home}>Pioneer Legacy Works</NavLink>
        </div>
      </div>
    </footer>
  );
}

export default OutdoorServicesFooter;
