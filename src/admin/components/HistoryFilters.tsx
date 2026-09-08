import type { BusinessSlug } from "../../shared/types/business";
import type { HistoryCategory, HistorySeverity } from "../../shared/types/history";

interface HistoryFiltersProps {
  search: string;
  business: BusinessSlug | "shared" | "all";
  category: HistoryCategory | "all";
  severity: HistorySeverity | "all";
  onSearchChange: (value: string) => void;
  onBusinessChange: (value: BusinessSlug | "shared" | "all") => void;
  onCategoryChange: (value: HistoryCategory | "all") => void;
  onSeverityChange: (value: HistorySeverity | "all") => void;
}

function HistoryFilters({
  search,
  business,
  category,
  severity,
  onSearchChange,
  onBusinessChange,
  onCategoryChange,
  onSeverityChange
}: HistoryFiltersProps) {
  return (
    <div className="history-filters">
      <label className="history-filters__search">
        <span>Search history</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search activity, people, or records"
        />
      </label>

      <label>
        <span>Business</span>
        <select
          value={business}
          onChange={(event) =>
            onBusinessChange(
              event.target.value as BusinessSlug | "shared" | "all"
            )
          }
        >
          <option value="all">All businesses</option>
          <option value="shared">Shared administration</option>
          <option value="outdoor-services">Outdoor Services</option>
          <option value="transport">Transport</option>
          <option value="productions">Productions</option>
        </select>
      </label>

      <label>
        <span>Category</span>
        <select
          value={category}
          onChange={(event) =>
            onCategoryChange(event.target.value as HistoryCategory | "all")
          }
        >
          <option value="all">All categories</option>
          <option value="customer">Customers</option>
          <option value="schedule">Scheduling</option>
          <option value="estimate">Estimates</option>
          <option value="expense">Expenses</option>
          <option value="form">Forms</option>
          <option value="system">System</option>
        </select>
      </label>

      <label>
        <span>Severity</span>
        <select
          value={severity}
          onChange={(event) =>
            onSeverityChange(event.target.value as HistorySeverity | "all")
          }
        >
          <option value="all">All levels</option>
          <option value="info">Information</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </label>
    </div>
  );
}

export default HistoryFilters;
