import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import EstimateDetail from "../components/EstimateDetail";
import EstimateFilters from "../components/EstimateFilters";
import EstimateForm from "../components/EstimateForm";
import EstimateTable from "../components/EstimateTable";
import {
  convertAdminQuoteToJob,
  getAdminQuoteDocument,
  listAdminAssignees,
  listAdminQuotes,
  updateAdminQuote,
  updateAdminQuoteDetails,
  type AdminQuote,
  type TeamMember
} from "../../services/api/admin";
import { calculateEstimateTotals, type Estimate, type EstimateStatus } from "../../shared/types/estimate";

function toEstimate(quote: AdminQuote): Estimate {
  return {
    id: quote.id,
    estimateNumber: quote.number,
    business: "landscaping",
    customerName: quote.customer.companyName || `${quote.customer.firstName} ${quote.customer.lastName}`,
    customerEmail: quote.customer.email,
    title: quote.title,
    status: quote.status.toLowerCase() as EstimateStatus,
    issuedDate: quote.createdAt.slice(0, 10),
    expirationDate: quote.expiresAt?.slice(0, 10) ?? "",
    lineItems: quote.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice)
    })),
    discount: Number(quote.discount),
    taxRate: Number(quote.taxRate),
    notes: quote.description || undefined,
    assignedTo: quote.assignedTo ? `${quote.assignedTo.firstName} ${quote.assignedTo.lastName}` : undefined
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function Estimates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const status = (searchParams.get("status") ?? "all") as EstimateStatus | "all";
  const page = Number(searchParams.get("page") ?? "1");
  const selectedId = searchParams.get("quote");
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [rawQuotes, setRawQuotes] = useState<AdminQuote[]>([]);
  const [assignees, setAssignees] = useState<TeamMember[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [draftAssignee, setDraftAssignee] = useState("");
  const [draftNotes, setDraftNotes] = useState("");

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all") next.set(key, value); else next.delete(key);
    if (key !== "page" && key !== "quote") next.delete("page");
    setSearchParams(next);
  };

  const load = () => {
    setLoading(true);
    setError("");
    void Promise.all([
      listAdminQuotes({ search, status: status === "all" ? undefined : status.toUpperCase(), page, pageSize: 20 }),
      listAdminAssignees()
    ]).then(([result, team]) => {
      const mapped = result.data.map(toEstimate);
      setRawQuotes(result.data);
      setAssignees(team.data);
      setEstimates(mapped);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
      if (!selectedId && mapped[0]) setParam("quote", mapped[0].id);
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  };

  useEffect(load, [search, status, page]);

  const selectedEstimate = estimates.find((item) => item.id === selectedId);
  const selectedRaw = rawQuotes.find((item) => item.id === selectedId);
  const totalPipeline = useMemo(() => estimates.reduce((sum, item) => sum + calculateEstimateTotals(item).total, 0), [estimates]);
  const approvedValue = useMemo(() => estimates.filter((item) => item.status === "approved").reduce((sum, item) => sum + calculateEstimateTotals(item).total, 0), [estimates]);

  useEffect(() => {
    setDraftAssignee(selectedRaw?.assignedToId ?? "");
    setDraftNotes(selectedRaw?.internalNotes ?? "");
    setEditing(false);
  }, [selectedRaw?.id, selectedRaw?.assignedToId, selectedRaw?.internalNotes]);

  const applyUpdatedQuote = (quote: AdminQuote) => {
    setRawQuotes((current) => current.map((item) => item.id === quote.id ? quote : item));
    setEstimates((current) => current.map((item) => item.id === quote.id ? toEstimate(quote) : item));
  };

  const updateSelectedStatus = async (nextStatus: EstimateStatus) => {
    if (!selectedEstimate) return;
    setSaving(true);
    setError("");
    try {
      const result = await updateAdminQuote(selectedEstimate.id, { status: nextStatus.toUpperCase() as AdminQuote["status"] });
      applyUpdatedQuote(result.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update the quote.");
    } finally { setSaving(false); }
  };

  const saveOperations = async () => {
    if (!selectedRaw) return;
    setSaving(true);
    setError("");
    try {
      const result = await updateAdminQuote(selectedRaw.id, { assignedToId: draftAssignee || null, internalNotes: draftNotes || null });
      applyUpdatedQuote(result.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update the quote.");
    } finally { setSaving(false); }
  };

  const saveQuoteDetails = async (estimate: Estimate) => {
    if (!selectedRaw) return;
    setSaving(true);
    setError("");
    try {
      const result = await updateAdminQuoteDetails(selectedRaw.id, {
        title: estimate.title,
        description: estimate.notes ?? null,
        expiresAt: estimate.expirationDate || null,
        discount: estimate.discount,
        taxRate: estimate.taxRate,
        items: estimate.lineItems
      });
      applyUpdatedQuote(result.data);
      setEditing(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save quote details.");
    } finally { setSaving(false); }
  };

  const convertToJob = async () => {
    if (!selectedRaw) return;
    setSaving(true);
    setError("");
    try {
      const result = await convertAdminQuoteToJob(selectedRaw.id);
      applyUpdatedQuote({
        ...selectedRaw,
        jobs: [...selectedRaw.jobs, { id: result.data.id, number: result.data.number, status: result.data.status }]
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to convert this quote to a job.");
    } finally { setSaving(false); }
  };

  const downloadDocument = async () => {
    if (!selectedRaw) return;
    setSaving(true);
    setError("");
    try {
      const result = await getAdminQuoteDocument(selectedRaw.id);
      const url = URL.createObjectURL(new Blob([result.data.content], { type: result.data.contentType }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.data.filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to generate the quote document.");
    } finally { setSaving(false); }
  };

  return (
    <section className="admin-estimates-page">
      <div className="admin-page-heading">
        <div><p className="admin-page-heading__eyebrow">Sales</p><h2 className="admin-page-heading__title">Quotes</h2><p className="admin-page-heading__description">Build, approve, document, and convert customer quotes into scheduled work.</p></div>
      </div>
      <div className="estimate-summary-grid">
        <article><span>Total Quotes</span><strong>{total}</strong></article>
        <article><span>Visible Pipeline</span><strong>{formatCurrency(totalPipeline)}</strong></article>
        <article><span>Approved Value</span><strong>{formatCurrency(approvedValue)}</strong></article>
        <article><span>Awaiting Response</span><strong>{estimates.filter((item) => item.status === "sent").length}</strong></article>
      </div>
      <EstimateFilters search={search} status={status} onSearchChange={(value) => setParam("search", value)} onStatusChange={(value) => setParam("status", value)} />
      {error ? <div className="admin-data-state admin-data-state--error" role="alert"><p>{error}</p><button type="button" onClick={load}>Retry</button></div> : null}
      {saving ? <div className="admin-data-state" aria-live="polite">Saving quote…</div> : null}
      {loading ? <div className="admin-data-state" aria-live="polite">Loading quotes…</div> : (
        <>
          <div className="estimates-page__layout">
            <section className="estimates-page__list">
              <EstimateTable estimates={estimates} selectedEstimateId={selectedId ?? undefined} onSelectEstimate={(estimate) => setParam("quote", estimate.id)} />
              <div className="admin-pagination"><button type="button" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setParam("page", String(page + 1))}>Next</button></div>
            </section>
            <EstimateDetail
              estimate={selectedEstimate}
              onStatusChange={updateSelectedStatus}
              onEdit={selectedRaw && ["DRAFT", "SENT"].includes(selectedRaw.status) ? () => setEditing(true) : undefined}
              onConvert={selectedRaw?.status === "APPROVED" && selectedRaw.jobs.length === 0 ? convertToJob : undefined}
              onDocument={selectedRaw ? downloadDocument : undefined}
              convertedJobNumber={selectedRaw?.jobs[0]?.number}
            />
          </div>
          {selectedRaw ? <section className="estimate-operations"><h3>Internal workflow</h3><label><span>Assigned to</span><select value={draftAssignee} onChange={(event) => setDraftAssignee(event.target.value)}><option value="">Unassigned</option>{assignees.map((member) => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}</select></label><label><span>Internal notes</span><textarea rows={5} value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} /></label><button type="button" disabled={saving} onClick={saveOperations}>{saving ? "Saving…" : "Save Workflow"}</button></section> : null}
        </>
      )}
      {editing && selectedEstimate ? <div className="estimate-modal" role="dialog" aria-modal="true" aria-label="Edit quote"><button className="estimate-modal__backdrop" type="button" aria-label="Close editor" onClick={() => setEditing(false)} /><div className="estimate-modal__content"><EstimateForm estimate={selectedEstimate} onSubmit={saveQuoteDetails} onCancel={() => setEditing(false)} /></div></div> : null}
    </section>
  );
}

export default Estimates;
