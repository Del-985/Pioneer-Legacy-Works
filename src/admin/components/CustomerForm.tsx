import { useState, type FormEvent } from "react";
import { availableBusinesses } from "../../shared/constants/businesses";
import type { BusinessSlug } from "../../shared/types/business";
import type { Customer } from "../../shared/types/customer";

interface CustomerFormProps {
  onCancel: () => void;
  onSubmit: (customer: Customer) => void;
}

function CustomerForm({ onCancel, onSubmit }: CustomerFormProps) {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState<BusinessSlug>("outdoor-services");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const now = new Date().toISOString();
    onSubmit({ id: `customer-${Date.now()}`, business, name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined, status: "lead", notes: notes.trim() || undefined, jobCount: 0, estimateCount: 0, lastActivityAt: now, activity: [{ id: `activity-${Date.now()}`, date: now, description: "Customer record created" }] });
  };

  return (
    <div className="customer-form-overlay" role="presentation">
      <form className="customer-form" onSubmit={handleSubmit}>
        <div className="customer-form__header"><div><p>New Record</p><h2>Add Customer</h2></div><button type="button" onClick={onCancel} aria-label="Close form">×</button></div>
        <div className="customer-form__fields">
          <label><span>Name</span><input required value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label><span>Business</span><select value={business} onChange={(event) => setBusiness(event.target.value as BusinessSlug)}>{availableBusinesses.map((item) => <option key={item.id} value={item.slug}>{item.shortName}</option>)}</select></label>
          <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label><span>Phone</span><input value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
          <label className="customer-form__notes"><span>Notes</span><textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        </div>
        <div className="customer-form__actions"><button type="button" onClick={onCancel}>Cancel</button><button className="customer-form__submit" type="submit">Create Customer</button></div>
      </form>
    </div>
  );
}

export default CustomerForm;