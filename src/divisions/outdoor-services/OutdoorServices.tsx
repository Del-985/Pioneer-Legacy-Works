import { Link } from "react-router-dom";

import { ROUTES } from "../../shared/constants/routes";

const services = [
  {
    title: "Lawn & Property Maintenance",
    description:
      "Recurring and one-time maintenance for lawns, beds, shrubs, cleanup, and general exterior upkeep."
  },
  {
    title: "Pressure Washing",
    description:
      "Exterior cleaning for driveways, walkways, siding, patios, fences, and commercial property surfaces."
  },
  {
    title: "Landscape Improvements",
    description:
      "Mulch, sod, trimming, planting, bed restoration, debris removal, and practical property upgrades."
  }
];

const customerTools = [
  {
    title: "Request Service",
    description: "Tell us what work you need and where the property is located.",
    path: ROUTES.divisions.outdoorServices.request,
    action: "Start a Request"
  },
  {
    title: "Request an Estimate",
    description: "Submit project details so we can prepare a clear estimate.",
    path: ROUTES.divisions.outdoorServices.quote,
    action: "Request an Estimate"
  },
  {
    title: "Customer Account",
    description: "Access requests, appointments, estimates, and future account tools.",
    path: ROUTES.divisions.outdoorServices.login,
    action: "Customer Login"
  }
];

function OutdoorServices() {
  return (
    <>
      <section className="outdoor-services-hero">
        <div className="container outdoor-services-hero__layout">
          <div className="outdoor-services-hero__copy">
            <p className="outdoor-services-eyebrow">Pioneer Outdoor Services</p>
            <h1>Dependable outdoor property care, without the runaround.</h1>
            <p className="outdoor-services-hero__description">
              Lawn maintenance, landscaping, pressure washing, seasonal cleanup,
              snow and ice service, and property maintenance for residential and
              commercial properties.
            </p>
            <div className="outdoor-services-hero__actions">
              <Link className="outdoor-services-button outdoor-services-button--primary" to={ROUTES.divisions.outdoorServices.request}>
                Request Service
              </Link>
              <Link className="outdoor-services-button outdoor-services-button--secondary" to={ROUTES.divisions.outdoorServices.services}>
                View Services
              </Link>
            </div>
            <div className="outdoor-services-hero__trust">
              <span>Clear communication</span>
              <span>Practical estimates</span>
              <span>Residential & commercial</span>
            </div>
          </div>

          <aside className="outdoor-services-hero__panel" aria-label="Quick service access">
            <p className="outdoor-services-hero__panel-label">How can we help?</p>
            <h2>Start with the right path.</h2>
            <div className="outdoor-services-hero__panel-links">
              {customerTools.map((tool) => (
                <Link key={tool.title} to={tool.path}>
                  <span>
                    <strong>{tool.title}</strong>
                    <small>{tool.description}</small>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="outdoor-services-section">
        <div className="container">
          <div className="outdoor-services-section__heading">
            <p className="outdoor-services-eyebrow">Core Services</p>
            <h2>Outdoor services built around what customers actually need.</h2>
            <p>
              Start with a simple request. We will review the property, confirm
              the scope, and provide the next steps without unnecessary complexity.
            </p>
          </div>

          <div className="outdoor-services-service-grid">
            {services.map((service, index) => (
              <article className="outdoor-services-service-card" key={service.title}>
                <span className="outdoor-services-service-card__number">0{index + 1}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={ROUTES.divisions.outdoorServices.services}>Learn More →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="outdoor-services-section outdoor-services-section--sand">
        <div className="container outdoor-services-process">
          <div className="outdoor-services-process__copy">
            <p className="outdoor-services-eyebrow">Simple Process</p>
            <h2>From request to completed work.</h2>
            <p>
              The Pioneer Outdoor Services site is being built as the customer
              hub for every step of the service process.
            </p>
          </div>

          <ol className="outdoor-services-process__steps">
            <li><strong>1</strong><span><b>Send a request</b><small>Share the property, service, and timing.</small></span></li>
            <li><strong>2</strong><span><b>Review the estimate</b><small>Receive a clear scope and price.</small></span></li>
            <li><strong>3</strong><span><b>Schedule the work</b><small>Choose an available service window.</small></span></li>
            <li><strong>4</strong><span><b>Track your service</b><small>Account tools will hold updates and records.</small></span></li>
          </ol>
        </div>
      </section>

      <section className="outdoor-services-customer-hub">
        <div className="container outdoor-services-customer-hub__layout">
          <div>
            <p className="outdoor-services-eyebrow">Customer Hub</p>
            <h2>One place for every future outdoor service module.</h2>
            <p>
              The landing page acts as the front door for customer login,
              service requests, estimates, scheduling, payments, and job history
              as those modules are completed.
            </p>
          </div>
          <div className="outdoor-services-customer-hub__cards">
            {customerTools.map((tool) => (
              <Link key={tool.title} to={tool.path}>
                <strong>{tool.title}</strong>
                <span>{tool.action}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="outdoor-services-cta">
        <div className="container outdoor-services-cta__content">
          <div>
            <p className="outdoor-services-eyebrow">Ready to Start?</p>
            <h2>Tell us what the property needs.</h2>
          </div>
          <Link className="outdoor-services-button outdoor-services-button--light" to={ROUTES.divisions.outdoorServices.request}>
            Request Service
          </Link>
        </div>
      </section>
    </>
  );
}

export default OutdoorServices;
