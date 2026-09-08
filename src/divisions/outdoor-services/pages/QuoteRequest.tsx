import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";
import { submitQuoteRequest } from "../../../services/api/outdoorServices";

const serviceOptions = [
  "Lawn Maintenance",
  "Pressure Washing",
  "Landscape Improvements",
  "Shrub & Tree Care",
  "Seasonal Cleanup",
  "Other"
];

interface QuoteRequestData {
  name: string;
  company: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  service: string;
  description: string;
  preferredContact: "phone" | "text" | "email";
  preferredTiming: string;
}

const emptyQuote: QuoteRequestData = {
  name: "",
  company: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "LA",
  zip: "",
  service: "",
  description: "",
  preferredContact: "phone",
  preferredTiming: ""
};

function QuoteRequest() {
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get("service") ?? "";
  const initialState = useMemo(
    () => ({
      ...emptyQuote,
      service: serviceOptions.includes(requestedService) ? requestedService : ""
    }),
    [requestedService]
  );

  const [formData, setFormData] = useState<QuoteRequestData>(initialState);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");

  const updateField = <K extends keyof QuoteRequestData>(
    key: K,
    value: QuoteRequestData[K]
  ) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 6);
    setAttachmentNames(files.map((file) => file.name));
  };

  const handleReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsReviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const nameParts = formData.name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      setSubmitError("Please enter both a first and last name.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await submitQuoteRequest({
        customer: {
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" "),
          companyName: formData.company || undefined,
          email: formData.email,
          phone: formData.phone
        },
        property: {
          streetAddress: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zip
        },
        serviceType: formData.service,
        description: formData.description,
        preferredTiming: formData.preferredTiming || undefined
      });
      setQuoteNumber(result.quote.number);
      setSubmitted(true);
      setIsReviewing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit the quote request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData(initialState);
    setAttachmentNames([]);
    setIsReviewing(false);
    setSubmitted(false);
    setSubmitError("");
    setQuoteNumber("");
  };

  if (submitted) {
    return (
      <section className="outdoor-services-quote-page">
        <div className="container outdoor-services-quote-confirmation">
          <p className="outdoor-services-eyebrow">Quote Request Received</p>
          <h1>Thank you, {formData.name}.</h1>
          <p>
            Your request has been saved. Your reference number is <strong>{quoteNumber}</strong>.
            The Pioneer Outdoor Services team can now review it and follow up with you.
          </p>
          <div className="outdoor-services-quote-confirmation__actions">
            <button
              className="outdoor-services-button outdoor-services-button--primary"
              type="button"
              onClick={clearForm}
            >
              Submit Another Request
            </button>
            <Link
              className="outdoor-services-button outdoor-services-button--secondary"
              to={ROUTES.divisions.outdoorServices.root}
            >
              Return Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (isReviewing) {
    return (
      <section className="outdoor-services-quote-page">
        <div className="container outdoor-services-quote-review">
          <div className="outdoor-services-quote-review__heading">
            <div>
              <p className="outdoor-services-eyebrow">Review</p>
              <h1>Confirm your quote request.</h1>
              <p>No account is required to submit this request.</p>
            </div>
          </div>

          <div className="outdoor-services-quote-review__grid">
            <section>
              <h2>Customer</h2>
              <p><strong>{formData.name}</strong></p>
              {formData.company ? <p>{formData.company}</p> : null}
              <p>{formData.phone}</p>
              <p>{formData.email}</p>
              <p>Preferred contact: {formData.preferredContact}</p>
            </section>

            <section>
              <h2>Property</h2>
              <p>{formData.street}</p>
              <p>{formData.city}, {formData.state} {formData.zip}</p>
              {formData.preferredTiming ? (
                <p>Preferred timing: {formData.preferredTiming}</p>
              ) : null}
            </section>

            <section className="outdoor-services-quote-review__wide">
              <h2>Requested Service</h2>
              <p><strong>{formData.service}</strong></p>
              <p>{formData.description}</p>
              <p>
                Attachments: {attachmentNames.length > 0
                  ? attachmentNames.join(", ")
                  : "None"}
              </p>
            </section>
          </div>

          <div className="outdoor-services-quote-review__actions">
            <button
              className="outdoor-services-button outdoor-services-button--secondary"
              type="button"
              onClick={() => setIsReviewing(false)}
            >
              Back to Edit
            </button>
            <button
              className="outdoor-services-button outdoor-services-button--primary"
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Quote Request"}
            </button>
          </div>
          {submitError ? <p role="alert">{submitError}</p> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="outdoor-services-quote-page">
      <div className="container outdoor-services-quote-layout">
        <div className="outdoor-services-quote-intro">
          <p className="outdoor-services-eyebrow">Free Quote Request</p>
          <h1>Tell us what the property needs.</h1>
          <p>
            No account is required. Send the basic project details and we will
            follow up to clarify the scope, inspect the property when needed, and
            prepare an estimate.
          </p>

          <div className="outdoor-services-quote-intro__steps">
            <div><strong>1</strong><span>Submit the property and project details.</span></div>
            <div><strong>2</strong><span>We review the request and contact you.</span></div>
            <div><strong>3</strong><span>You receive a clear estimate before work begins.</span></div>
          </div>
        </div>

        <form className="outdoor-services-quote-form" onSubmit={handleReview}>
          <fieldset>
            <legend>Customer Information</legend>
            <div className="outdoor-services-quote-form__grid">
              <label>
                <span>Name *</span>
                <input
                  required
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </label>
              <label>
                <span>Company</span>
                <input
                  value={formData.company}
                  onChange={(event) => updateField("company", event.target.value)}
                />
              </label>
              <label>
                <span>Email *</span>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </label>
              <label>
                <span>Phone *</span>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </label>
              <label className="outdoor-services-quote-form__wide">
                <span>Preferred Contact Method</span>
                <select
                  value={formData.preferredContact}
                  onChange={(event) =>
                    updateField(
                      "preferredContact",
                      event.target.value as QuoteRequestData["preferredContact"]
                    )
                  }
                >
                  <option value="phone">Phone</option>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Service Address</legend>
            <div className="outdoor-services-quote-form__grid">
              <label className="outdoor-services-quote-form__wide">
                <span>Street Address *</span>
                <input
                  required
                  value={formData.street}
                  onChange={(event) => updateField("street", event.target.value)}
                />
              </label>
              <label>
                <span>City *</span>
                <input
                  required
                  value={formData.city}
                  onChange={(event) => updateField("city", event.target.value)}
                />
              </label>
              <div className="outdoor-services-quote-form__state-zip">
                <label>
                  <span>State *</span>
                  <input
                    required
                    maxLength={2}
                    value={formData.state}
                    onChange={(event) => updateField("state", event.target.value.toUpperCase())}
                  />
                </label>
                <label>
                  <span>ZIP *</span>
                  <input
                    required
                    inputMode="numeric"
                    value={formData.zip}
                    onChange={(event) => updateField("zip", event.target.value)}
                  />
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Project Details</legend>
            <div className="outdoor-services-quote-form__grid">
              <label>
                <span>Requested Service *</span>
                <select
                  required
                  value={formData.service}
                  onChange={(event) => updateField("service", event.target.value)}
                >
                  <option value="">Select a service</option>
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Preferred Timing</span>
                <input
                  placeholder="Example: Within two weeks"
                  value={formData.preferredTiming}
                  onChange={(event) => updateField("preferredTiming", event.target.value)}
                />
              </label>
              <label className="outdoor-services-quote-form__wide">
                <span>Describe the Work *</span>
                <textarea
                  required
                  rows={6}
                  placeholder="Describe the area, current condition, approximate size, and the result you want."
                  value={formData.description}
                  onChange={(event) => updateField("description", event.target.value)}
                />
              </label>
              <label className="outdoor-services-quote-form__wide outdoor-services-quote-form__upload">
                <span>Photos</span>
                <input
                  accept="image/*"
                  multiple
                  type="file"
                  onChange={handleFiles}
                />
                <small>Up to six image names are previewed locally until storage is connected.</small>
                {attachmentNames.length > 0 ? (
                  <ul>
                    {attachmentNames.map((name) => <li key={name}>{name}</li>)}
                  </ul>
                ) : null}
              </label>
            </div>
          </fieldset>

          <p className="outdoor-services-quote-form__notice">
            Submitting this form requests an estimate. It does not authorize work
            or create a contract.
          </p>

          <div className="outdoor-services-quote-form__actions">
            <button
              className="outdoor-services-button outdoor-services-button--secondary"
              type="button"
              onClick={clearForm}
            >
              Clear
            </button>
            <button
              className="outdoor-services-button outdoor-services-button--primary"
              type="submit"
            >
              Review Request
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default QuoteRequest;
