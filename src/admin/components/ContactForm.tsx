import { useState } from "react";
import type { FormEvent } from "react";

import type { BusinessSlug } from "../../shared/types/business";
import type {
  ContactCategory,
  NewContactInput
} from "../../shared/types/contact";

interface ContactFormProps {
  onSubmit: (contact: NewContactInput) => void;
  onCancel: () => void;
}

function ContactForm({ onSubmit, onCancel }: ContactFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [business, setBusiness] = useState<BusinessSlug | "shared">("shared");
  const [category, setCategory] = useState<ContactCategory>("vendor");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company.trim() || undefined,
      title: title.trim() || undefined,
      business,
      category,
      status: "active",
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined
    });
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form__header">
        <div>
          <p>Directory</p>
          <h2>Add Contact</h2>
        </div>
        <button type="button" onClick={onCancel}>Close</button>
      </div>

      <div className="contact-form__grid">
        <label>
          <span>First name</span>
          <input required value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        </label>
        <label>
          <span>Last name</span>
          <input required value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </label>
        <label>
          <span>Company</span>
          <input value={company} onChange={(event) => setCompany(event.target.value)} />
        </label>
        <label>
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          <span>Business</span>
          <select value={business} onChange={(event) => setBusiness(event.target.value as BusinessSlug | "shared")}>
            <option value="shared">Shared / Corporate</option>
            <option value="outdoor-services">Outdoor Services</option>
            <option value="transport">Transport</option>
            <option value="productions">Productions</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as ContactCategory)}>
            <option value="vendor">Vendor</option>
            <option value="employee">Employee</option>
            <option value="contractor">Contractor</option>
            <option value="partner">Partner</option>
            <option value="government">Government</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          <span>Phone</span>
          <input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label className="contact-form__full">
          <span>Notes</span>
          <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
      </div>

      <div className="contact-form__actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save Contact</button>
      </div>
    </form>
  );
}

export default ContactForm;
