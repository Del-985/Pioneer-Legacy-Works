import type { BusinessSlug } from "../../shared/types/business";
import type { JobPriority, JobStatus } from "../../shared/types/job";

interface JobFiltersProps {
  search: string;
  business: BusinessSlug | "all";
  status: JobStatus | "all";
  priority: JobPriority | "all";
  onSearchChange: (value: string) => void;
  onBusinessChange: (value: BusinessSlug | "all") => void;
  onStatusChange: (value: JobStatus | "all") => void;
  onPriorityChange: (value: JobPriority | "all") => void;
}

function JobFilters({
  search,
  business,
  status,
  priority,
  onSearchChange,
  onBusinessChange,
  onStatusChange,
  onPriorityChange
}: JobFiltersProps) {
  return (
    <div className="job-filters">
      <label className="job-filters__search">
        <span>Search jobs</span>
        <input
          type="search"
          value={search}
          placeholder="Job number, customer, title, or location"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <label>
        <span>Business</span>
        <select
          value={business}
          onChange={(event) =>
            onBusinessChange(event.target.value as BusinessSlug | "all")
          }
        >
          <option value="all">All businesses</option>
          <option value="outdoor-services">Outdoor Services</option>
          <option value="transport">Transport</option>
          <option value="productions">Productions</option>
        </select>
      </label>

      <label>
        <span>Status</span>
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as JobStatus | "all")
          }
        >
          <option value="all">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In progress</option>
          <option value="waiting">Waiting</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      <label>
        <span>Priority</span>
        <select
          value={priority}
          onChange={(event) =>
            onPriorityChange(event.target.value as JobPriority | "all")
          }
        >
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </label>
    </div>
  );
}

export default JobFilters;
