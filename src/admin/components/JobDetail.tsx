import { useEffect, useState } from "react";

import type { JobPriority, JobRecord, JobStatus } from "../../shared/types/job";

interface JobDetailProps {
  job?: JobRecord;
  onStatusChange: (status: JobStatus) => void;
  onUpdate: (patch: { priority?: JobPriority; value?: number; crewNotes?: string | null }) => void;
}

function JobDetail({ job, onStatusChange, onUpdate }: JobDetailProps) {
  const [draftPriority, setDraftPriority] = useState<JobPriority>("normal");
  const [draftValue, setDraftValue] = useState(0);
  const [draftNotes, setDraftNotes] = useState("");

  useEffect(() => {
    setDraftPriority(job?.priority ?? "normal");
    setDraftValue(job?.estimatedValue ?? 0);
    setDraftNotes(job?.notes ?? "");
  }, [job?.id, job?.priority, job?.estimatedValue, job?.notes]);

  if (!job) {
    return (
      <aside className="job-detail job-detail--empty">
        <h3>Select a job</h3>
        <p>Choose a job to review its schedule, crew, equipment, and checklist.</p>
      </aside>
    );
  }

  return (
    <aside className="job-detail">
      <div className="job-detail__header">
        <div>
          <p>{job.jobNumber}</p>
          <h2>{job.title}</h2>
          <span>{job.customerName}</span>
        </div>
        <span className={`job-priority job-priority--${job.priority}`}>
          {job.priority}
        </span>
      </div>

      <div className="job-detail__status-actions">
        {(["scheduled", "in-progress", "waiting", "completed", "cancelled"] as JobStatus[]).map((status) => (
          <button
            key={status}
            type="button"
            className={job.status === status ? "is-active" : ""}
            onClick={() => onStatusChange(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <dl className="job-detail__grid">
        <div><dt>Business</dt><dd>{job.business}</dd></div>
        <div><dt>Scheduled</dt><dd>{job.scheduledDate} {job.startTime ?? ""}</dd></div>
        <div><dt>Location</dt><dd>{job.location || "Not assigned"}</dd></div>
        <div><dt>Estimate</dt><dd>{job.estimateId || "Not linked"}</dd></div>
        <div><dt>Value</dt><dd>${job.estimatedValue.toLocaleString()}</dd></div>
      </dl>

      <section className="job-detail__section job-detail__editor">
        <h3>Job details</h3>
        <label><span>Priority</span><select value={draftPriority} onChange={(event) => setDraftPriority(event.target.value as JobPriority)}>{(["low", "normal", "high", "urgent"] as JobPriority[]).map((priority) => <option key={priority}>{priority}</option>)}</select></label>
        <label><span>Value</span><input min="0" step="0.01" type="number" value={draftValue} onChange={(event) => setDraftValue(Number(event.target.value))} /></label>
        <label><span>Crew notes</span><textarea rows={4} value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} /></label>
        <button type="button" onClick={() => onUpdate({ priority: draftPriority, value: draftValue, crewNotes: draftNotes || null })}>Save job details</button>
      </section>

      <section className="job-detail__section">
        <h3>Description</h3>
        <p>{job.description}</p>
      </section>

      <section className="job-detail__section">
        <h3>Crew</h3>
        <p>{job.crew.length ? job.crew.join(", ") : "No crew assigned"}</p>
      </section>

      <section className="job-detail__section">
        <h3>Equipment</h3>
        <p>{job.equipment.length ? job.equipment.join(", ") : "No equipment assigned"}</p>
      </section>

      {job.notes ? (
        <section className="job-detail__section">
          <h3>Internal notes</h3>
          <p>{job.notes}</p>
        </section>
      ) : null}
    </aside>
  );
}

export default JobDetail;
