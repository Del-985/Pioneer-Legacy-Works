import { useState } from "react";
import type { FormEvent } from "react";

import { availableBusinesses } from "../../shared/constants/businesses";
import type { ExpenseDraft, ExpenseCategory } from "../../shared/types/expense";

interface ExpenseFormProps {
  onSubmit: (expense: ExpenseDraft) => void;
  onCancel: () => void;
}

const categories: ExpenseCategory[] = ["equipment", "fuel", "materials", "maintenance", "insurance", "marketing", "payroll", "utilities", "other"];

function ExpenseForm({ onSubmit, onCancel }: ExpenseFormProps) {
  const [draft, setDraft] = useState<ExpenseDraft>({
    business: "outdoor-services",
    vendor: "",
    description: "",
    amount: 0,
    category: "materials",
    expenseDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "",
    referenceNumber: "",
    notes: "",
    receiptAttached: false
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.vendor.trim() || !draft.description.trim() || draft.amount <= 0) return;
    onSubmit(draft);
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="expense-form__header"><div><p>New Record</p><h2>Record Expense</h2></div><button type="button" onClick={onCancel}>Close</button></div>
      <div className="expense-form__grid">
        <label><span>Business</span><select value={draft.business} onChange={(e) => setDraft({ ...draft, business: e.target.value as ExpenseDraft["business"] })}>{availableBusinesses.map((business) => <option key={business.id} value={business.slug}>{business.shortName}</option>)}</select></label>
        <label><span>Expense date</span><input type="date" value={draft.expenseDate} onChange={(e) => setDraft({ ...draft, expenseDate: e.target.value })} /></label>
        <label><span>Vendor</span><input value={draft.vendor} onChange={(e) => setDraft({ ...draft, vendor: e.target.value })} required /></label>
        <label><span>Amount</span><input type="number" min="0.01" step="0.01" value={draft.amount || ""} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} required /></label>
        <label><span>Category</span><select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as ExpenseCategory })}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label><span>Payment method</span><input value={draft.paymentMethod} onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value })} /></label>
        <label className="expense-form__wide"><span>Description</span><input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} required /></label>
        <label><span>Reference number</span><input value={draft.referenceNumber} onChange={(e) => setDraft({ ...draft, referenceNumber: e.target.value })} /></label>
        <label className="expense-form__checkbox"><input type="checkbox" checked={draft.receiptAttached} onChange={(e) => setDraft({ ...draft, receiptAttached: e.target.checked })} /><span>Receipt attached</span></label>
        <label className="expense-form__wide"><span>Notes</span><textarea rows={4} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></label>
      </div>
      <div className="expense-form__actions"><button type="button" onClick={onCancel}>Cancel</button><button className="expense-form__submit" type="submit">Save Expense</button></div>
    </form>
  );
}

export default ExpenseForm;
