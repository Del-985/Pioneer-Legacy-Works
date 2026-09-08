import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import CustomerDetail from "../components/CustomerDetail";
import CustomerFilters from "../components/CustomerFilters";
import CustomerTable from "../components/CustomerTable";
import { getAdminCustomer, listAdminCustomers, type AdminCustomer } from "../../services/api/admin";
import type { Customer, CustomerStatus } from "../../shared/types/customer";

function toCustomer(record: AdminCustomer): Customer {
  const activities = [
    ...record.quotes.map((item) => ({ id: item.id ?? `quote-${item.createdAt}`, date: item.createdAt, description: `Quote ${item.number ?? "request"}: ${item.title ?? item.status ?? "created"}` })),
    ...record.serviceRequests.map((item) => ({ id: item.id ?? `request-${item.createdAt}`, date: item.createdAt, description: `Service request: ${item.serviceType ?? item.status ?? "created"}` })),
    ...record.jobs.map((item) => ({ id: item.id ?? `job-${item.createdAt}`, date: item.createdAt, description: `Job ${item.number ?? "record"}: ${item.title ?? item.status ?? "created"}` }))
  ].sort((a, b) => b.date.localeCompare(a.date));
  const property = record.properties[0];

  return {
    id: record.id,
    business: "outdoor-services",
    name: `${record.firstName} ${record.lastName}`,
    company: record.companyName ?? undefined,
    email: record.email,
    phone: record.phone,
    status: record.status.toLowerCase() as CustomerStatus,
    address: property ? { street: property.streetAddress, city: property.city, state: property.state, postalCode: property.postalCode } : undefined,
    notes: property?.accessNotes ?? undefined,
    jobCount: record._count.jobs,
    estimateCount: record._count.quotes,
    serviceRequestCount: record._count.serviceRequests,
    lastActivityAt: activities[0]?.date ?? record.updatedAt,
    activity: activities.slice(0, 20)
  };
}

function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const status = (searchParams.get("status") ?? "all") as CustomerStatus | "all";
  const page = Number(searchParams.get("page") ?? "1");
  const selectedId = searchParams.get("customer");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all") next.set(key, value); else next.delete(key);
    if (key !== "page" && key !== "customer") next.delete("page");
    setSearchParams(next);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const apiStatus = status === "active" || status === "inactive" || status === "archived" ? status.toUpperCase() : undefined;
    void listAdminCustomers({ search, status: apiStatus, page, pageSize: 20 })
      .then((result) => {
        if (!active) return;
        setCustomers(result.data.map(toCustomer));
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
        if (!selectedId && result.data[0]) setParam("customer", result.data[0].id);
      })
      .catch((reason: Error) => active && setError(reason.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [search, status, page, reloadToken]);

  useEffect(() => {
    if (!selectedId) { setSelectedCustomer(undefined); return; }
    let active = true;
    void getAdminCustomer(selectedId)
      .then((result) => active && setSelectedCustomer(toCustomer(result.data)))
      .catch((reason: Error) => active && setError(reason.message));
    return () => { active = false; };
  }, [selectedId]);

  const selectedCustomerId = useMemo(() => selectedCustomer?.id ?? selectedId ?? undefined, [selectedCustomer, selectedId]);

  return (
    <section className="admin-customers-page">
      <div className="admin-page-heading"><div><p className="admin-page-heading__eyebrow">Records</p><h2 className="admin-page-heading__title">Customers</h2><p className="admin-page-heading__description">Live customer records created by account registration and public intake.</p></div></div>
      <CustomerFilters search={search} status={status} onSearchChange={(value) => setParam("search", value)} onStatusChange={(value) => setParam("status", value)} />
      {error ? <div className="admin-data-state admin-data-state--error" role="alert"><p>{error}</p><button type="button" onClick={() => setReloadToken((value) => value + 1)}>Retry</button></div> : null}
      {loading ? <div className="admin-data-state" aria-live="polite">Loading customers…</div> : (
        <div className="customers-page__layout"><section className="customers-page__list"><div className="customers-page__list-header"><h2>Customer Directory</h2><span>{total} records</span></div><CustomerTable customers={customers} selectedCustomerId={selectedCustomerId} onSelectCustomer={(customer) => setParam("customer", customer.id)} /><div className="admin-pagination"><button type="button" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setParam("page", String(page + 1))}>Next</button></div></section><CustomerDetail customer={selectedCustomer} /></div>
      )}
    </section>
  );
}

export default Customers;
