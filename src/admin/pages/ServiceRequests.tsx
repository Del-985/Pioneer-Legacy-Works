import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  convertAdminServiceRequestToJob,
  listAdminAssignees,
  listAdminServiceRequests,
  updateAdminServiceRequest,
  type AdminServiceRequest,
  type TeamMember
} from "../../services/api/admin";

const statuses: AdminServiceRequest["status"][] = ["NEW", "REVIEWING", "SCHEDULED", "COMPLETED", "CANCELLED"];

function ServiceRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const selectedId = searchParams.get("request");
  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [assignees, setAssignees] = useState<TeamMember[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draftStatus, setDraftStatus] = useState<AdminServiceRequest["status"]>("NEW");
  const [draftAssignee, setDraftAssignee] = useState("");
  const [draftNotes, setDraftNotes] = useState("");

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page" && key !== "request") next.delete("page");
    setSearchParams(next);
  };

  const load = () => {
    setLoading(true);
    setError("");
    void Promise.all([
      listAdminServiceRequests({ search, status: status || undefined, page, pageSize: 20 }),
      listAdminAssignees()
    ]).then(([result, team]) => {
      setRequests(result.data);
      setAssignees(team.data);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
      if (!selectedId && result.data[0]) setParam("request", result.data[0].id);
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  };

  useEffect(load, [search, status, page]);

  const selected = requests.find((item) => item.id === selectedId);
  useEffect(() => {
    if (!selected) return;
    setDraftStatus(selected.status);
    setDraftAssignee(selected.assignedToId ?? "");
    setDraftNotes(selected.internalNotes ?? "");
  }, [selected?.id, selected?.status, selected?.assignedToId, selected?.internalNotes]);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const result = await updateAdminServiceRequest(selected.id, {
        status: draftStatus,
        assignedToId: draftAssignee || null,
        internalNotes: draftNotes || null
      });
      setRequests((current) => current.map((item) => item.id === selected.id ? result.data : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update the service request.");
    } finally { setSaving(false); }
  };

  const convertToJob = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const result = await convertAdminServiceRequestToJob(selected.id);
      setRequests((current) => current.map((item) => item.id === selected.id ? {
        ...item,
        status: "SCHEDULED",
        jobs: [...item.jobs, { id: result.data.id, number: result.data.number, status: result.data.status }]
      } : item));
      setDraftStatus("SCHEDULED");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to convert this request to a job.");
    } finally { setSaving(false); }
  };

  return (
    <section className="admin-service-requests-page">
      <div className="admin-page-heading"><div><p className="admin-page-heading__eyebrow">Intake</p><h2 className="admin-page-heading__title">Service Requests</h2><p className="admin-page-heading__description">Review, assign, and convert customer work requests.</p></div></div>
      <div className="service-request-filters"><label><span>Search requests</span><input type="search" value={search} placeholder="Customer, service, or details" onChange={(event) => setParam("search", event.target.value)} /></label><label><span>Status</span><select value={status} onChange={(event) => setParam("status", event.target.value)}><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.toLowerCase().replace("_", " ")}</option>)}</select></label></div>
      {error ? <div className="admin-data-state admin-data-state--error" role="alert"><p>{error}</p><button type="button" onClick={load}>Retry</button></div> : null}
      {loading ? <div className="admin-data-state" aria-live="polite">Loading service requests…</div> : (
        <div className="service-requests-layout">
          <section className="service-requests-list">
            <div className="service-requests-list__heading"><h3>Request Inbox</h3><span>{total} records</span></div>
            {requests.length === 0 ? <div className="admin-data-state">No service requests match these filters.</div> : <div className="service-requests-table-wrap"><table className="service-requests-table"><thead><tr><th>Customer</th><th>Service</th><th>Status</th><th>Received</th></tr></thead><tbody>{requests.map((item) => <tr key={item.id} className={item.id === selectedId ? "service-requests-table__selected" : ""} onClick={() => setParam("request", item.id)}><td><strong>{item.customer.companyName || `${item.customer.firstName} ${item.customer.lastName}`}</strong><span>{item.customer.email}</span></td><td>{item.serviceType}</td><td><span className={`service-request-status service-request-status--${item.status.toLowerCase()}`}>{item.status.toLowerCase().replace("_", " ")}</span></td><td>{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
            <div className="admin-pagination"><button type="button" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setParam("page", String(page + 1))}>Next</button></div>
          </section>
          <aside className="service-request-detail">
            {selected ? <>
              <div className="service-request-detail__header"><p>{selected.source}</p><h3>{selected.serviceType}</h3><span>{selected.status.toLowerCase().replace("_", " ")}</span></div>
              <section><h4>Customer</h4><p><strong>{selected.customer.firstName} {selected.customer.lastName}</strong><br />{selected.customer.email}<br />{selected.customer.phone}</p></section>
              <section><h4>Property</h4><p>{selected.property ? `${selected.property.streetAddress}, ${selected.property.city}, ${selected.property.state} ${selected.property.postalCode}` : "No property linked"}</p></section>
              <section><h4>Requested work</h4><p>{selected.description}</p><p>Preferred: {selected.preferredDate ? new Date(selected.preferredDate).toLocaleDateString() : "No date"} · {selected.preferredWindow ?? "Any time"}</p></section>
              {selected.jobs[0] ? <section><h4>Converted job</h4><p>{selected.jobs[0].number}</p></section> : null}
              <label><span>Status</span><select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value as AdminServiceRequest["status"])}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label><span>Assigned to</span><select value={draftAssignee} onChange={(event) => setDraftAssignee(event.target.value)}><option value="">Unassigned</option>{assignees.map((member) => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}</select></label>
              <label><span>Internal notes</span><textarea rows={6} value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} /></label>
              <div className="service-request-detail__actions"><button type="button" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Changes"}</button>{selected.jobs.length === 0 && !["COMPLETED", "CANCELLED"].includes(selected.status) ? <button type="button" disabled={saving} onClick={convertToJob}>Create Job</button> : null}</div>
            </> : <div className="admin-data-state">Select a service request.</div>}
          </aside>
        </div>
      )}
    </section>
  );
}

export default ServiceRequests;
