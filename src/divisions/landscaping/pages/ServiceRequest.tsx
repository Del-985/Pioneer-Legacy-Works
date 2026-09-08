import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";
import { submitServiceRequest } from "../../../services/api/landscaping";

const serviceOptions = [
  "Lawn Maintenance",
  "Pressure Washing",
  "Landscape Improvements",
  "Shrub and Hedge Trimming",
  "Tree Care",
  "Seasonal Cleanup",
  "Other"
];

interface ServiceRequestData {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  service: string;
  details: string;
  preferredDate: string;
  preferredTime: string;
  accessNotes: string;
  consent: boolean;
}

const initialData: ServiceRequestData = {
  name: "",
  company: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "LA",
  zip: "",
  service: "",
  details: "",
  preferredDate: "",
  preferredTime: "Anytime",
  accessNotes: "",
  consent: false
};

function ServiceRequest() {
  const [data, setData] = useState(initialData);
  const [reviewing, setReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const location = useMemo(
    () => [data.address, data.city, data.state, data.zip].filter(Boolean).join(", "),
    [data]
  );

  const update = <K extends keyof ServiceRequestData>(key: K, value: ServiceRequestData[K]) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const handleReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const nameParts = data.name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      setSubmitError("Please enter both a first and last name.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await submitServiceRequest({
        customer: {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" "),
          companyName: data.company || undefined,
          email: data.email,
          phone: data.phone
        },
        property: {
          streetAddress: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.zip,
          accessNotes: data.accessNotes || undefined
        },
        serviceType: data.service,
        description: data.details,
        preferredDate: data.preferredDate || undefined,
        preferredWindow: data.preferredTime || undefined
      });
      setSubmitted(true);
      setReviewing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit the service request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="landscaping-form-page">
        <div className="container landscaping-form-success">
          <p className="landscaping-eyebrow">Request Received</p>
          <h1>We have your service request.</h1>
          <p>
            Your request has been transmitted and saved. The Pioneer Outdoor Services
            team can now review it and contact you about scheduling.
          </p>
          <div className="landscaping-form-success__actions">
            <button
              className="landscaping-button landscaping-button--primary"
              type="button"
              onClick={() => {
                setData(initialData);
                setReviewing(false);
                setSubmitted(false);
                setSubmitError("");
              }}
            >
              Start Another Request
            </button>
            <Link className="landscaping-button landscaping-button--secondary" to={ROUTES.divisions.landscaping.root}>
              Return Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (reviewing) {
    return (
      <section className="landscaping-form-page">
        <div className="container landscaping-review-card">
          <p className="landscaping-eyebrow">Review Request</p>
          <h1>Confirm the service details.</h1>
          <dl className="landscaping-review-list">
            <div><dt>Customer</dt><dd>{data.name}{data.company ? ` · ${data.company}` : ""}</dd></div>
            <div><dt>Contact</dt><dd>{data.phone}<br />{data.email}</dd></div>
            <div><dt>Service Address</dt><dd>{location}</dd></div>
            <div><dt>Requested Service</dt><dd>{data.service}</dd></div>
            <div><dt>Preferred Schedule</dt><dd>{data.preferredDate || "No date selected"} · {data.preferredTime}</dd></div>
            <div><dt>Work Details</dt><dd>{data.details}</dd></div>
            <div><dt>Access Notes</dt><dd>{data.accessNotes || "None provided"}</dd></div>
          </dl>
          <div className="landscaping-form-actions">
            <button className="landscaping-button landscaping-button--secondary" type="button" onClick={() => setReviewing(false)}>
              Back to Edit
            </button>
            <button className="landscaping-button landscaping-button--primary" type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
          {submitError ? <p role="alert">{submitError}</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="landscaping-form-page">
      <div className="container landscaping-form-page__layout">
        <div className="landscaping-form-page__intro">
          <p className="landscaping-eyebrow">Service Request</p>
          <h1>Tell us what the property needs.</h1>
          <p>
            Use this form when you already know which service you need. For pricing
            on an uncertain project, use the quote request instead.
          </p>
          <Link to={ROUTES.divisions.landscaping.quote}>Need an estimate instead? Request a quote →</Link>
        </div>

        <form className="landscaping-customer-form" onSubmit={handleReview}>
          <fieldset>
            <legend>Customer Information</legend>
            <div className="landscaping-form-grid">
              <label><span>Name *</span><input required value={data.name} onChange={(event) => update("name", event.target.value)} /></label>
              <label><span>Company</span><input value={data.company} onChange={(event) => update("company", event.target.value)} /></label>
              <label><span>Email *</span><input required type="email" value={data.email} onChange={(event) => update("email", event.target.value)} /></label>
              <label><span>Phone *</span><input required type="tel" value={data.phone} onChange={(event) => update("phone", event.target.value)} /></label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Service Address</legend>
            <div className="landscaping-form-grid">
              <label className="landscaping-form-grid__wide"><span>Street Address *</span><input required value={data.address} onChange={(event) => update("address", event.target.value)} /></label>
              <label><span>City *</span><input required value={data.city} onChange={(event) => update("city", event.target.value)} /></label>
              <label><span>State *</span><input required maxLength={2} value={data.state} onChange={(event) => update("state", event.target.value.toUpperCase())} /></label>
              <label><span>ZIP Code *</span><input required inputMode="numeric" value={data.zip} onChange={(event) => update("zip", event.target.value)} /></label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Requested Work</legend>
            <div className="landscaping-form-grid">
              <label><span>Service *</span><select required value={data.service} onChange={(event) => update("service", event.target.value)}><option value="">Select a service</option>{serviceOptions.map((service) => <option key={service}>{service}</option>)}</select></label>
              <label><span>Preferred Date</span><input type="date" value={data.preferredDate} onChange={(event) => update("preferredDate", event.target.value)} /></label>
              <label><span>Preferred Time</span><select value={data.preferredTime} onChange={(event) => update("preferredTime", event.target.value)}><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Anytime</option></select></label>
              <label className="landscaping-form-grid__wide"><span>Describe the work requested *</span><textarea required rows={6} value={data.details} onChange={(event) => update("details", event.target.value)} /></label>
              <label className="landscaping-form-grid__wide"><span>Gate code, pets, access instructions, or other notes</span><textarea rows={3} value={data.accessNotes} onChange={(event) => update("accessNotes", event.target.value)} /></label>
            </div>
          </fieldset>

          <label className="landscaping-form-consent">
            <input required type="checkbox" checked={data.consent} onChange={(event) => update("consent", event.target.checked)} />
            <span>I authorize Pioneer Outdoor Services to contact me about this request. I understand this submission does not guarantee scheduling or establish a service contract.</span>
          </label>

          <div className="landscaping-form-actions">
            <button className="landscaping-button landscaping-button--secondary" type="button" onClick={() => setData(initialData)}>Clear</button>
            <button className="landscaping-button landscaping-button--primary" type="submit">Review Request</button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ServiceRequest;
