import { useEffect, useMemo, useState } from "react";

import JobDetail from "../components/JobDetail";
import JobFilters from "../components/JobFilters";
import JobTable from "../components/JobTable";
import { listAdminJobs, updateAdminJob, type AdminJob } from "../../services/api/admin";
import type { BusinessSlug } from "../../shared/types/business";
import type { JobPriority, JobRecord, JobStatus } from "../../shared/types/job";

function toJob(record: AdminJob): JobRecord {
  const scheduled = record.scheduledStart ? new Date(record.scheduledStart) : undefined;
  const location = record.property
    ? `${record.property.streetAddress}, ${record.property.city}, ${record.property.state} ${record.property.postalCode}`
    : undefined;
  return {
    id: record.id,
    jobNumber: record.number,
    business: "outdoor-services",
    customerName: record.customer.companyName || `${record.customer.firstName} ${record.customer.lastName}`,
    title: record.title,
    description: record.description ?? "",
    status: record.status.toLowerCase().replace("_", "-") as JobStatus,
    priority: record.priority,
    scheduledDate: scheduled?.toISOString().slice(0, 10) ?? record.createdAt.slice(0, 10),
    startTime: scheduled?.toTimeString().slice(0, 5),
    endTime: record.scheduledEnd ? new Date(record.scheduledEnd).toTimeString().slice(0, 5) : undefined,
    location,
    crew: [],
    equipment: [],
    estimateId: record.quote?.number,
    estimatedValue: Number(record.value),
    notes: record.crewNotes ?? undefined,
    checklist: [],
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function Jobs() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>();
  const [search, setSearch] = useState("");
  const [business, setBusiness] = useState<BusinessSlug | "all">("all");
  const [status, setStatus] = useState<JobStatus | "all">("all");
  const [priority, setPriority] = useState<JobPriority | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    void listAdminJobs({
      search,
      status: status === "all" ? undefined : status.toUpperCase().replace("-", "_"),
      priority: priority === "all" ? undefined : priority,
      pageSize: 100
    }).then((result) => {
      const mapped = result.data.map(toJob);
      setJobs(mapped);
      setSelectedJobId((current) => current && mapped.some((job) => job.id === current) ? current : mapped[0]?.id);
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  };

  useEffect(load, [search, status, priority]);

  const filteredJobs = useMemo(
    () => business === "all" ? jobs : jobs.filter((job) => job.business === business),
    [jobs, business]
  );
  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  const activeCount = jobs.filter((job) => ["scheduled", "in-progress", "waiting"].includes(job.status)).length;
  const scheduledValue = jobs.filter((job) => job.status !== "cancelled").reduce((sum, job) => sum + job.estimatedValue, 0);

  const updateSelectedJob = async (patch: {
    status?: JobStatus;
    priority?: JobPriority;
    value?: number;
    crewNotes?: string | null;
  }) => {
    if (!selectedJob) return;
    setSaving(true);
    setError("");
    try {
      const result = await updateAdminJob(selectedJob.id, {
        ...patch,
        status: patch.status?.toUpperCase().replace("-", "_") as AdminJob["status"] | undefined
      });
      setJobs((current) => current.map((job) => job.id === selectedJob.id ? toJob(result.data) : job));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update the job.");
    } finally { setSaving(false); }
  };

  return (
    <section className="jobs-page">
      <div className="admin-page-heading"><div><p className="admin-page-heading__eyebrow">Operations</p><h2 className="admin-page-heading__title">Jobs</h2><p className="admin-page-heading__description">Track converted work from scheduling through completion.</p></div></div>
      <div className="jobs-summary">
        <article><span>Total jobs</span><strong>{jobs.length}</strong></article>
        <article><span>Active jobs</span><strong>{activeCount}</strong></article>
        <article><span>In progress</span><strong>{jobs.filter((job) => job.status === "in-progress").length}</strong></article>
        <article><span>Scheduled value</span><strong>${scheduledValue.toLocaleString()}</strong></article>
      </div>
      <JobFilters search={search} business={business} status={status} priority={priority} onSearchChange={setSearch} onBusinessChange={setBusiness} onStatusChange={setStatus} onPriorityChange={setPriority} />
      {error ? <div className="admin-data-state admin-data-state--error" role="alert"><p>{error}</p><button type="button" onClick={load}>Retry</button></div> : null}
      {saving ? <div className="admin-data-state" aria-live="polite">Saving job…</div> : null}
      {loading ? <div className="admin-data-state" aria-live="polite">Loading jobs…</div> : (
        <div className="jobs-layout">
          <JobTable jobs={filteredJobs} selectedJobId={selectedJobId} onSelectJob={(job) => setSelectedJobId(job.id)} />
          <JobDetail
            job={selectedJob}
            onStatusChange={(nextStatus) => updateSelectedJob({ status: nextStatus })}
            onUpdate={(patch) => updateSelectedJob(patch)}
          />
        </div>
      )}
    </section>
  );
}

export default Jobs;
