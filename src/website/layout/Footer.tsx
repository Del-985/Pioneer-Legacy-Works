import { Link } from "react-router-dom";

import { ROUTES } from "../../shared/constants/routes";

const companyLinks = [
  {
    label: "Pioneer Outdoor Services",
    path: ROUTES.divisions.outdoorServices.root
  },
  {
    label: "Pioneer Productions",
    path: "/productions"
  },
  {
    label: "Pioneer Transport",
    path: "/transport"
  }
];

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <section className="site-footer__brand">
          <Link
            className="site-brand site-brand--footer"
            to="/"
            aria-label="Pioneer Legacy Works home"
          >
            <span className="site-brand__mark" aria-hidden="true">
              P
            </span>

            <span className="site-brand__text">
              <span className="site-brand__name">Pioneer</span>
              <span className="site-brand__subtitle">Legacy Works</span>
            </span>
          </Link>

          <p className="site-footer__description">
            A growing group of service businesses built around dependable
            work, direct communication, and long-term customer relationships.
          </p>
        </section>

        <section className="site-footer__section">
          <h2 className="site-footer__heading">Explore</h2>

          <ul className="site-footer__links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/companies">Companies</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </section>

        <section className="site-footer__section">
          <h2 className="site-footer__heading">Pioneer Companies</h2>

          <ul className="site-footer__links">
            {companyLinks.map((company) => (
              <li key={company.path}>
                <Link to={company.path}>{company.label}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="site-footer__section">
          <h2 className="site-footer__heading">Get Started</h2>

          <p className="site-footer__contact-text">
            Tell us what service you need, and we will connect you with the
            appropriate Pioneer company.
          </p>

          <Link className="button button--secondary" to="/contact">
            Contact Pioneer
          </Link>
        </section>
      </div>

      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-inner">
          <p>
            &copy; {currentYear} Pioneer Legacy Works. All rights reserved.
          </p>

          <p>Built to support the Pioneer family of businesses.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
