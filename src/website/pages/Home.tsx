import { Link } from "react-router-dom";

import pioneerEnterprisesLogo from "../assets/pioneer-enterprises-logo.svg";

const companies = [
  {
    name: "Pioneer Outdoor Services",
    description:
      "Landscaping, lawn care, exterior cleaning, snow and ice service, and dependable property maintenance for residential and commercial customers.",
    path: "https://pioneeroutdoorservices.com",
    label: "Outdoor & Property Services"
  },
  {
    name: "Pioneer Transport",
    description:
      "Reliable transportation and logistics services built around clear communication, careful handling, and dependable delivery.",
    path: "/transport",
    label: "Transportation"
  },
  {
    name: "Pioneer Productions",
    description:
      "Creative production services designed to help businesses, organizations, and individuals tell their stories professionally.",
    path: "/productions",
    label: "Media & Production"
  }
];

const values = [
  {
    title: "Dependable Service",
    description:
      "Each Pioneer company is built around clear expectations, consistent communication, and work completed with care."
  },
  {
    title: "Practical Solutions",
    description:
      "We focus on services that solve real customer problems without unnecessary complexity."
  },
  {
    title: "Built for Growth",
    description:
      "Pioneer Legacy Works creates a shared foundation that allows every company to grow without losing its identity."
  }
];

function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero__content">
          <div className="home-hero__copy">
            <div className="home-hero__brand">
              <img
                className="home-hero__logo"
                src={pioneerEnterprisesLogo}
                alt="Pioneer Enterprises"
              />
            </div>

            <h1 className="home-hero__title">
              Building businesses that solve real problems.
            </h1>

            <p className="home-hero__description">
              Pioneer Legacy Works supports a growing family of service companies
              across property care, transportation, logistics, and media
              production.
            </p>

            <div className="home-hero__actions">
              <Link className="button button--primary" to="/companies">
                Explore Our Companies
              </Link>

              <Link className="button button--secondary" to="/contact">
                Contact Pioneer
              </Link>
            </div>
          </div>

          <div className="home-hero__panel">
            <p className="home-hero__panel-label">Which service do you need?</p>

            <div className="home-hero__quick-links">
              {companies.map((company) => (
                <a
                  className="home-hero__quick-link"
                  href={company.path}
                  key={company.path}
                >
                  <span>{company.name}</span>
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="home-section__heading">
            <p className="home-section__eyebrow">Our Companies</p>

            <h2 className="home-section__title">
              One organization. Multiple specialized businesses.
            </h2>

            <p className="home-section__description">
              Each Pioneer company operates with its own services, customers,
              and goals while sharing the same commitment to quality and
              professional execution.
            </p>
          </div>

          <div className="business-grid">
            {companies.map((company) => (
              <article className="business-card" key={company.path}>
                <p className="business-card__label">{company.label}</p>

                <h3 className="business-card__title">{company.name}</h3>

                <p className="business-card__description">
                  {company.description}
                </p>

                <a className="business-card__link" href={company.path}>
                  Visit Company
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--muted">
        <div className="container">
          <div className="home-section__heading">
            <p className="home-section__eyebrow">Why Pioneer</p>

            <h2 className="home-section__title">
              A shared standard across every business.
            </h2>
          </div>

          <div className="value-grid">
            {values.map((value) => (
              <article className="value-card" key={value.title}>
                <h3 className="value-card__title">{value.title}</h3>

                <p className="value-card__description">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="container home-growth">
          <div className="home-growth__copy">
            <p className="home-section__eyebrow">Growing Together</p>

            <h2 className="home-section__title">
              Built to support customers today and expansion tomorrow.
            </h2>

            <p className="home-section__description">
              Pioneer Legacy Works provides the shared structure behind each
              company, including technology, administration, operations,
              branding, and long-term planning.
            </p>
          </div>

          <div className="home-growth__stats">
            <article className="stat-card">
              <strong className="stat-card__value">3</strong>
              <span className="stat-card__label">Operating Divisions</span>
            </article>

            <article className="stat-card">
              <strong className="stat-card__value">1</strong>
              <span className="stat-card__label">Shared Standard</span>
            </article>

            <article className="stat-card">
              <strong className="stat-card__value">100%</strong>
              <span className="stat-card__label">Customer Focused</span>
            </article>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="container home-cta__content">
          <div>
            <p className="home-cta__eyebrow">Start Here</p>

            <h2 className="home-cta__title">
              Tell us what you need. We will connect you with the right Pioneer
              company.
            </h2>
          </div>

          <Link className="button button--primary" to="/contact">
            Work With Pioneer
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;
