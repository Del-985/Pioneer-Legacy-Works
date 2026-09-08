import { useMemo, useState, type FormEvent } from "react";

import type { BusinessSlug } from "../../shared/types/business";
import type { Estimate, EstimateLineItem } from "../../shared/types/estimate";

interface EstimateFormProps {
  estimate?: Estimate;
  onSubmit: (estimate: Estimate) => void;
  onCancel: () => void;
}

const emptyItem = (): EstimateLineItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  unitPrice: 0
});

function EstimateForm({ estimate, onSubmit, onCancel }: EstimateFormProps) {
  const [customerName, setCustomerName] = useState(estimate?.customerName ?? "");
  const [customerEmail, setCustomerEmail] = useState(estimate?.customerEmail ?? "");
  const [title, setTitle] = useState(estimate?.title ?? "");
  const [business, setBusiness] = useState<BusinessSlug>(estimate?.business ?? "outdoor-services");
  const [expirationDate, setExpirationDate] = useState(estimate?.expirationDate ?? "");
  const [discount, setDiscount] = useState(estimate?.discount ?? 0);
  const [taxRate, setTaxRate] = useState(estimate?.taxRate ?? 0);
  const [notes, setNotes] = useState(estimate?.notes ?? "");
  const [lineItems, setLineItems] = useState<EstimateLineItem[]>(
    estimate?.lineItems.length ? estimate.lineItems : [emptyItem()]
  );

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [lineItems]
  );

  const updateItem = (id: string, patch: Partial<EstimateLineItem>) => {
    setLineItems((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const now = new Date();
    const issuedDate = estimate?.issuedDate ?? now.toISOString().slice(0, 10);

    onSubmit({
      id: estimate?.id ?? crypto.randomUUID(),
      estimateNumber:
        estimate?.estimateNumber ?? `EST-${String(Date.now()).slice(-6)}`,
      business,
      customerName,
      customerEmail: customerEmail || undefined,
      title,
      status: estimate?.status ?? "draft",
      issuedDate,
      expirationDate,
      lineItems: lineItems.filter((item) => item.description.trim()),
      discount,
      taxRate,
      notes: notes || undefined
    });
  };

  return (
    <form className="estimate-form" onSubmit={handleSubmit}>
      <div className="estimate-form__header">
        <div>
          <p>{estimate ? "Update Estimate" : "New Estimate"}</p>
          <h2>{estimate ? estimate.estimateNumber : "Create estimate"}</h2>
        </div>
        <button type="button" onClick={onCancel}>Close</button>
      </div>

      <div className="estimate-form__grid">
        <label>
          <span>Customer name</span>
          <input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
        </label>
        <label>
          <span>Customer email</span>
          <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
        </label>
        <label>
          <span>Project title</span>
          <input required value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          <span>Business</span>
          <select value={business} onChange={(event) => setBusiness(event.target.value as BusinessSlug)}>
            <option value="outdoor-services">Outdoor Services</option>
            <option value="transport">Transport</option>
            <option value="productions">Productions</option>
          </select>
        </label>
        <label>
          <span>Expiration date</span>
          <input required type="date" value={expirationDate} onChange={(event) => setExpirationDate(event.target.value)} />
        </label>
        <label>
          <span>Discount ($)</span>
          <input min="0" step="0.01" type="number" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} />
        </label>
        <label>
          <span>Tax rate (%)</span>
          <input min="0" step="0.01" type="number" value={taxRate} onChange={(event) => setTaxRate(Number(event.target.value))} />
        </label>
      </div>

      <div className="estimate-form__items">
        <div className="estimate-form__items-header">
          <h3>Line items</h3>
          <button type="button" onClick={() => setLineItems((items) => [...items, emptyItem()])}>Add line item</button>
        </div>

        {lineItems.map((item) => (
          <div className="estimate-form__item" key={item.id}>
            <input
              aria-label="Description"
              placeholder="Service or material"
              value={item.description}
              onChange={(event) => updateItem(item.id, { description: event.target.value })}
            />
            <input
              aria-label="Quantity"
              min="0"
              step="0.01"
              type="number"
              value={item.quantity}
              onChange={(event) => updateItem(item.id, { quantity: Number(event.target.value) })}
            />
            <input
              aria-label="Unit price"
              min="0"
              step="0.01"
              type="number"
              value={item.unitPrice}
              onChange={(event) => updateItem(item.id, { unitPrice: Number(event.target.value) })}
            />
            <button
              type="button"
              onClick={() => setLineItems((items) => items.filter((entry) => entry.id !== item.id))}
              disabled={lineItems.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <label className="estimate-form__notes">
        <span>Notes</span>
        <textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <div className="estimate-form__footer">
        <strong>Current subtotal: ${subtotal.toFixed(2)}</strong>
        <div>
          <button type="button" onClick={onCancel}>Cancel</button>
          <button className="estimate-form__save" type="submit">Save Estimate</button>
        </div>
      </div>
    </form>
  );
}

export default EstimateForm;
