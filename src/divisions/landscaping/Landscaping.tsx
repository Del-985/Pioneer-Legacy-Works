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
    path: ROUTES.divisions.landscaping.request,
    action: "Start a Request"
  },
  {
    title: "Request an Estimate",
    description: "Submit project details so we can prepare a clear estimate.",
    path: ROUTES.divisions.landscaping.quote,
    action: "Request an Estimate"
  },
  {
    title: "Customer Account",
    description: "Access requests, appointments, estimates, and future account tools.",
    path: ROUTES.divisions.landscaping.login,
    action: "Customer Login"
  }
];

function Landscaping() {
  return (
    <>
      <section className="landscaping-hero">
        <div className="container landscaping-hero__layout">
          <div className="landscaping-hero__copy">
            <p className="landscaping-eyebrow">Pioneer Outdoor Services</p>
            <h1>Dependable outdoor property care, without the runaround.</h1>
            <p className="landscaping-hero__description">
              Lawn maintenance, landscaping, pressure washing, seasonal cleanup,
              snow and ice service, and property maintenance for residential and
              commercial properties.
            </p>
            <div className="landscaping-hero__actions">
              <Link className="landscaping-button landscaping-button--primary" to={ROUTES.divisions.landscaping.request}>
                Request Service
              </Link>
              <Link className="landscaping-button landscaping-button--secondary" to={ROUTES.divisions.landscaping.services}>
                View Services
              </Link>
            </div>
            <div className="landscaping-hero__trust">
              <span>Clear communication</span>
              <span>Practical estimates</span>
              <span>Residential & commercial</span>
            </div>
          </div>

          <aside className="landscaping-hero__panel" aria-label="Quick service access">
            <p className="landscaping-hero__panel-label">How can we help?</p>
            <h2>Start with the right path.</h2>
            <div className="landscaping-hero__panel-links">
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

      <section className="landscaping-section">
        <div className="container">
          <div className="landscaping-section__heading">
            <p className="landscaping-eyebrow">Core Services</p>
            <h2>Outdoor services built around what customers actually need.</h2>
            <p>
              Start with a simple request. We will review the property, confirm
              the scope, and provide the next steps without unnecessary complexity.
            </p>
          </div>

          <div className="landscaping-service-grid">
            {services.map((service, index) => (
              <article className="landscaping-service-card" key={service.title}>
                <span className="landscaping-service-card__number">0{index + 1}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={ROUTES.divisions.landscaping.services}>Learn More →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landscaping-section landscaping-section--sand">
        <div className="container landscaping-process">
          <div className="landscaping-process__copy">
            <p className="landscaping-eyebrow">Simple Process</p>
            <h2>From request to completed work.</h2>
            <p>
              The Pioneer Outdoor Services site is being built as the customer
              hub for every step of the service process.
            </p>
          </div>

          <ol className="landscaping-process__steps">
            <li><strong>1</strong><span><b>Send a request</b><small>Share the property, service, and timing.</small></span></li>
            <li><strong>2</strong><span><b>Review the estimate</b><small>Receive a clear scope and price.</small></span></li>
            <li><strong>3</strong><span><b>Schedule the work</b><small>Choose an available service window.</small></span></li>
            <li><strong>4</strong><span><b>Track your service</b><small>Account tools will hold updates and records.</small></span></li>
          </ol>
        </div>
      </section>

      <section className="landscaping-customer-hub">
        <div className="container landscaping-customer-hub__layout">
          <div>
            <p className="landscaping-eyebrow">Customer Hub</p>
            <h2>One place for every future outdoor service module.</h2>
            <p>
              The landing page acts as the front door for customer login,
              service requests, estimates, scheduling, payments, and job history
              as those modules are completed.
            </p>
          </div>
          <div className="landscaping-customer-hub__cards">
            {customerTools.map((tool) => (
              <Link key={tool.title} to={tool.path}>
                <strong>{tool.title}</strong>
                <span>{tool.action}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="landscaping-cta">
        <div className="container landscaping-cta__content">
          <div>
            <p className="landscaping-eyebrow">Ready to Start?</p>
            <h2>Tell us what the property needs.</h2>
          </div>
          <Link className="landscaping-button landscaping-button--light" to={ROUTES.divisions.landscaping.request}>
            Request Service
          </Link>
        </div>
      </section>
    </>
  );
}

export default Landscaping;
