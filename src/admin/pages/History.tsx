import { useMemo, useState } from "react";

import HistoryDetail from "../components/HistoryDetail";
import HistoryFilters from "../components/HistoryFilters";
import type { BusinessSlug } from "../../shared/types/business";
import type {
  HistoryCategory,
  HistoryRecord,
  HistorySeverity
} from "../../shared/types/history";

const historyRecords: HistoryRecord[] = [
  {
    id: "history-1",
    business: "outdoor-services",
    category: "estimate",
    severity: "success",
    title: "Estimate approved",
    description: "Estimate EST-1004 was approved and is ready for scheduling.",
    actor: "Administrator",
    timestamp: "2026-07-15T09:18:00",
    relatedLabel: "estimate",
    relatedPath: "/admin/estimates",
    metadata: {
      Estimate: "EST-1004",
      Customer: "Example Homeowner",
      Total: "$1,275.00"
    }
  },
  {
    id: "history-2",
    business: "transport",
    category: "schedule",
    severity: "info",
    title: "Delivery scheduled",
    description: "A regional equipment delivery was added to the calendar.",
    actor: "Administrator",
    timestamp: "2026-07-15T08:42:00",
    relatedLabel: "calendar",
    relatedPath: "/admin/calendar",
    metadata: {
      Date: "July 17, 2026",
      Customer: "Sample Commercial Client"
    }
  },
  {
    id: "history-3",
    business: "shared",
    category: "expense",
    severity: "warning",
    title: "High-value expense recorded",
    description: "An expense above the configured review threshold was entered.",
    actor: "Administrator",
    timestamp: "2026-07-14T16:05:00",
    relatedLabel: "expense",
    relatedPath: "/admin/expenses",
    metadata: {
      Vendor: "Equipment Supply Co.",
      Amount: "$742.18",
      Status: "Pending review"
    }
  },
  {
    id: "history-4",
    business: "productions",
    category: "customer",
    severity: "success",
    title: "Customer added",
    description: "A new production customer record was created.",
    actor: "Administrator",
    timestamp: "2026-07-14T13:20:00",
    relatedLabel: "customer",
    relatedPath: "/admin/customers",
    metadata: {
      Customer: "Sample Production Client"
    }
  },
  {
    id: "history-5",
    business: "shared",
    category: "system",
    severity: "critical",
    title: "Failed notification delivery",
    description: "An urgent notification could not be delivered by email.",
    actor: "System",
    timestamp: "2026-07-13T18:47:00",
    relatedLabel: "notifications",
    relatedPath: "/admin/notifications",
    metadata: {
      Channel: "Email",
      Result: "Delivery failed"
    }
  }
];

function History() {
  const [search, setSearch] = useState("");
  const [business, setBusiness] = useState<BusinessSlug | "shared" | "all">("all");
  const [category, setCategory] = useState<HistoryCategory | "all">("all");
  const [severity, setSeverity] = useState<HistorySeverity | "all">("all");
  const [selectedId, setSelectedId] = useState(historyRecords[0]?.id ?? "");

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return historyRecords.filter((record) => {
      const matchesSearch =
        !query ||
        record.title.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query) ||
        record.actor.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (business === "all" || record.business === business) &&
        (category === "all" || record.category === category) &&
        (severity === "all" || record.severity === severity)
      );
    });
  }, [business, category, search, severity]);

  const selectedRecord =
    filteredRecords.find((record) => record.id === selectedId) ??
    filteredRecords[0];

  return (
    <section className="admin-history-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-page-heading__eyebrow">Audit Trail</p>
          <h2 className="admin-page-heading__title">History</h2>
          <p className="admin-page-heading__description">
            Review changes, approvals, alerts, and operational activity across Pioneer.
          </p>
        </div>
      </div>

      <div className="history-summary">
        <article><strong>{historyRecords.length}</strong><span>Total records</span></article>
        <article><strong>{historyRecords.filter((record) => record.severity === "critical").length}</strong><span>Critical</span></article>
        <article><strong>{historyRecords.filter((record) => record.severity === "warning").length}</strong><span>Warnings</span></article>
        <article><strong>{historyRecords.filter((record) => record.severity === "success").length}</strong><span>Successful actions</span></article>
      </div>

      <HistoryFilters
        search={search}
        business={business}
        category={category}
        severity={severity}
        onSearchChange={setSearch}
        onBusinessChange={setBusiness}
        onCategoryChange={setCategory}
        onSeverityChange={setSeverity}
      />

      <div className="history-layout">
        <div className="history-list" role="list">
          {filteredRecords.length ? (
            filteredRecords.map((record) => (
              <button
                className={`history-record${selectedRecord?.id === record.id ? " history-record--selected" : ""}`}
                key={record.id}
                type="button"
                onClick={() => setSelectedId(record.id)}
              >
                <div className="history-record__header">
                  <span className={`history-badge history-badge--${record.severity}`}>
                    {record.severity}
                  </span>
                  <time>{new Date(record.timestamp).toLocaleString()}</time>
                </div>
                <h3>{record.title}</h3>
                <p>{record.description}</p>
                <div className="history-record__footer">
                  <span>{record.business}</span>
                  <span>{record.category}</span>
                  <span>{record.actor}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="history-empty-state">
              <h3>No history records found</h3>
              <p>Adjust the filters to broaden the activity search.</p>
            </div>
          )}
        </div>

        <HistoryDetail record={selectedRecord} />
      </div>
    </section>
  );
}

export default History;
