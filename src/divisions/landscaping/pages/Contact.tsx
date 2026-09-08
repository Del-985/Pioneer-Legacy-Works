import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";

function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <section className="landscaping-contact-page">
      <div className="container">
        <div className="landscaping-page-heading">
          <p className="landscaping-eyebrow">Contact</p>
          <h1>Talk with Pioneer Outdoor Services.</h1>
          <p>
            Use the contact form for general questions. For pricing or service scheduling,
            use the dedicated quote or service-request forms.
          </p>
        </div>

        <div className="landscaping-contact-layout">
          <aside className="landscaping-contact-details">
            <div>
              <span>Phone</span>
              <strong>To be published before launch</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>To be published before launch</strong>
            </div>
            <div>
              <span>Service Area</span>
              <strong>Toledo, Monroe, Temperance, and surrounding areas</strong>
            </div>
            <div>
              <span>Business Hours</span>
              <strong>Hours will be finalized before launch</strong>
            </div>

            <div className="landscaping-contact-details__actions">
              <Link className="landscaping-button landscaping-button--primary" to={ROUTES.divisions.landscaping.quote}>
                Request a Quote
              </Link>
              <Link className="landscaping-button landscaping-button--secondary" to={ROUTES.divisions.landscaping.request}>
                Request Service
              </Link>
            </div>
          </aside>

          <form className="landscaping-customer-form landscaping-contact-form" onSubmit={handleSubmit}>
            <fieldset>
              <legend>Send a Message</legend>
              <div className="landscaping-form-grid">
                <label><span>Name *</span><input required name="name" /></label>
                <label><span>Email *</span><input required name="email" type="email" /></label>
                <label><span>Phone</span><input name="phone" type="tel" /></label>
                <label><span>Topic *</span><select required name="topic"><option value="">Select a topic</option><option>General Question</option><option>Existing Request</option><option>Existing Estimate</option><option>Scheduling</option><option>Billing</option><option>Other</option></select></label>
                <label className="landscaping-form-grid__wide"><span>Message *</span><textarea required name="message" rows={7} /></label>
              </div>
            </fieldset>

            <label className="landscaping-form-consent">
              <input required type="checkbox" />
              <span>I authorize Pioneer Outdoor Services to contact me regarding this message.</span>
            </label>

            <div className="landscaping-form-actions">
              <button className="landscaping-button landscaping-button--primary" type="submit">Send Message</button>
            </div>

            {sent ? (
              <p className="landscaping-form-status" role="status">
                Frontend preview only: this message has not been transmitted. Backend delivery will be connected later.
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
