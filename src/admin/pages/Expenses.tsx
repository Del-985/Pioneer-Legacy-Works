import { useMemo, useState } from "react";

import ExpenseDetail from "../components/ExpenseDetail";
import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import type { BusinessSlug } from "../../shared/types/business";
import type {
  Expense,
  ExpenseCategory,
  ExpenseDraft,
  ExpenseStatus
} from "../../shared/types/expense";

const seedExpenses: Expense[] = [
  {
    id: "expense-1",
    business: "outdoor-services",
    vendor: "Regional Equipment Supply",
    description: "Commercial pressure washer replacement pump",
    amount: 875.42,
    category: "equipment",
    status: "pending",
    expenseDate: "2026-07-14",
    paymentMethod: "Company card",
    referenceNumber: "PO-1048",
    notes: "Replacement required before the next commercial job.",
    receiptAttached: true,
    createdAt: "2026-07-14T15:20:00"
  },
  {
    id: "expense-2",
    business: "transport",
    vendor: "Parish Fuel Stop",
    description: "Truck fuel",
    amount: 146.18,
    category: "fuel",
    status: "paid",
    expenseDate: "2026-07-13",
    paymentMethod: "Company card",
    referenceNumber: "FUEL-0713",
    receiptAttached: true,
    createdAt: "2026-07-13T18:10:00"
  },
  {
    id: "expense-3",
    business: "productions",
    vendor: "Creative Cloud Services",
    description: "Monthly production software subscription",
    amount: 89.99,
    category: "utilities",
    status: "approved",
    expenseDate: "2026-07-10",
    paymentMethod: "Auto-pay",
    receiptAttached: false,
    createdAt: "2026-07-10T09:00:00"
  }
];

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function Expenses() {
  const [expenses, setExpenses] = useState(seedExpenses);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(seedExpenses[0]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [business, setBusiness] = useState<BusinessSlug | "all">("all");
  const [category, setCategory] = useState<ExpenseCategory | "all">("all");
  const [status, setStatus] = useState<ExpenseStatus | "all">("all");

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const matchesSearch = !query || [expense.vendor, expense.description, expense.referenceNumber || ""].some((value) => value.toLowerCase().includes(query));
      return matchesSearch && (business === "all" || expense.business === business) && (category === "all" || expense.category === category) && (status === "all" || expense.status === status);
    });
  }, [expenses, search, business, category, status]);

  const totals = useMemo(() => ({
    total: expenses.reduce((sum, item) => sum + item.amount, 0),
    pending: expenses.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.amount, 0),
    large: expenses.filter((item) => item.amount > 500).length,
    receiptsMissing: expenses.filter((item) => !item.receiptAttached).length
  }), [expenses]);

  const addExpense = (draft: ExpenseDraft) => {
    const expense: Expense = {
      ...draft,
      id: `expense-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    setExpenses((current) => [expense, ...current]);
    setSelectedExpense(expense);
    setShowForm(false);
  };

  return (
    <section className="admin-expenses-page">
      <div className="admin-page-heading">
        <div><p className="admin-page-heading__eyebrow">Finance</p><h2 className="admin-page-heading__title">Expenses</h2><p className="admin-page-heading__description">Track spending, receipts, approvals, and high-value expenses across Pioneer businesses.</p></div>
        <button className="expenses-page__add" type="button" onClick={() => setShowForm(true)}>Record Expense</button>
      </div>

      <div className="expense-summary">
        <article><span>Total recorded</span><strong>{currency(totals.total)}</strong></article>
        <article><span>Pending approval</span><strong>{currency(totals.pending)}</strong></article>
        <article><span>Expenses over $500</span><strong>{totals.large}</strong></article>
        <article><span>Missing receipts</span><strong>{totals.receiptsMissing}</strong></article>
      </div>

      {showForm ? <ExpenseForm onSubmit={addExpense} onCancel={() => setShowForm(false)} /> : null}

      <ExpenseFilters search={search} business={business} category={category} status={status} onSearchChange={setSearch} onBusinessChange={setBusiness} onCategoryChange={setCategory} onStatusChange={setStatus} />

      <div className="expenses-page__layout">
        <section className="expenses-page__records">
          <div className="expenses-page__records-header"><div><p>Expense Ledger</p><h2>{filteredExpenses.length} records</h2></div></div>
          <ExpenseTable expenses={filteredExpenses} selectedExpenseId={selectedExpense?.id} onSelectExpense={setSelectedExpense} />
        </section>
        <ExpenseDetail expense={selectedExpense} />
      </div>
    </section>
  );
}

export default Expenses;
