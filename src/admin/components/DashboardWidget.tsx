import { Link } from "react-router-dom";

import {
  defaultQuickFormIds,
  formDefinitions
} from "../../shared/constants/forms";
import {
  defaultWeeklySnapshotSectionIds,
  weeklySnapshotSections
} from "../../shared/constants/weeklySnapshot";
import { ROUTES } from "../../shared/constants/routes";
import type {
  DashboardWidgetDefinition,
  DashboardWidgetInstance,
  DashboardWidgetSize,
  DashboardWidgetType,
  WeeklySnapshotSectionId
} from "../../shared/types/dashboard";

export const dashboardWidgetCatalog: DashboardWidgetDefinition[] = [
  { type: "today-snapshot", title: "Today's Snapshot", description: "Immediate work, requests, messages, expenses, and notices.", defaultSize: "tall" },
  { type: "metrics", title: "Metrics", description: "Condensed financial and operational performance.", defaultSize: "medium" },
  { type: "quick-forms", title: "Quick Forms", description: "Fast access to commonly used forms.", defaultSize: "small" },
  { type: "upcoming-jobs", title: "Upcoming Jobs", description: "The next scheduled jobs across Pioneer businesses.", defaultSize: "medium" },
  { type: "weekly-snapshot", title: "Weekly Snapshot", description: "A configurable executive summary for the selected period.", defaultSize: "medium" },
  { type: "open-estimates", title: "Open Estimates", description: "Draft and sent estimates awaiting action.", defaultSize: "small" },
  { type: "outstanding-expenses", title: "Outstanding Expenses", description: "Pending and high-value expense records.", defaultSize: "small" },
  { type: "notifications", title: "Notifications", description: "Unread and urgent notifications.", defaultSize: "small" },
  { type: "recent-activity", title: "Recent Activity", description: "Recent administrative activity across the system.", defaultSize: "medium" },
  { type: "business-health", title: "Business Health", description: "Status summary for every Pioneer division.", defaultSize: "medium" }
];

const sizeOptions: DashboardWidgetSize[] = ["small", "medium", "large", "tall"];

interface DashboardWidgetProps {
  widget: DashboardWidgetInstance;
  editing: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onChangeType: (type: DashboardWidgetType) => void;
  onChangeSize: (size: DashboardWidgetSize) => void;
  onConfigure: () => void;
}

interface WeeklySectionDisplay {
  metrics: Array<{ value: string; label: string }>;
  path: string;
}

const weeklySectionDisplays: Record<WeeklySnapshotSectionId, WeeklySectionDisplay> = {
  jobs: {
    metrics: [
      { value: "0", label: "Completed" },
      { value: "0", label: "Active" },
      { value: "0", label: "Waiting" }
    ],
    path: ROUTES.admin.jobs
  },
  estimates: {
    metrics: [
      { value: "0", label: "Sent" },
      { value: "0", label: "Approved" },
      { value: "0%", label: "Conversion" }
    ],
    path: ROUTES.admin.estimates
  },
  revenue: {
    metrics: [
      { value: "$0", label: "Earned" },
      { value: "$0", label: "Outstanding" }
    ],
    path: ROUTES.admin.metrics
  },
  expenses: {
    metrics: [
      { value: "$0", label: "Spent" },
      { value: "0", label: "Pending" },
      { value: "$0", label: "Largest" }
    ],
    path: ROUTES.admin.expenses
  },
  customers: {
    metrics: [
      { value: "0", label: "New" },
      { value: "0", label: "Returning" },
      { value: "0", label: "Active" }
    ],
    path: ROUTES.admin.customers
  },
  notifications: {
    metrics: [
      { value: "0", label: "Unread" },
      { value: "0", label: "Urgent" }
    ],
    path: ROUTES.admin.notifications
  },
  safety: {
    metrics: [
      { value: "0", label: "Incidents" },
      { value: "0", label: "Safety Issues" },
      { value: "0", label: "Inspections Due" }
    ],
    path: ROUTES.admin.forms
  },
  upcoming: {
    metrics: [
      { value: "0", label: "Jobs Next Week" },
      { value: "0", label: "Appointments" }
    ],
    path: ROUTES.admin.calendar
  },
  "outdoor-services": {
    metrics: [
      { value: "0", label: "Jobs" },
      { value: "$0", label: "Revenue" },
      { value: "0", label: "Requests" }
    ],
    path: ROUTES.admin.jobs
  },
  transport: {
    metrics: [
      { value: "0", label: "Deliveries" },
      { value: "0", label: "Miles" },
      { value: "0", label: "Delays" }
    ],
    path: ROUTES.admin.jobs
  },
  productions: {
    metrics: [
      { value: "0", label: "Projects" },
      { value: "0", label: "Bookings" },
      { value: "$0", label: "Revenue" }
    ],
    path: ROUTES.admin.jobs
  },
  inventory: {
    metrics: [
      { value: "0", label: "Low Stock" },
      { value: "0", label: "Assigned" },
      { value: "0", label: "Maintenance" }
    ],
    path: ROUTES.admin.history
  }
};

function WeeklySnapshotBody({ widget }: { widget: DashboardWidgetInstance }) {
  const selectedIds =
    widget.settings.selectedWeeklySectionIds ??
    defaultWeeklySnapshotSectionIds;
  const sectionsById = new Map(
    weeklySnapshotSections.map((section) => [section.id, section])
  );
  const selectedSections = selectedIds
    .map((id) => sectionsById.get(id))
    .filter((section): section is (typeof weeklySnapshotSections)[number] => Boolean(section))
    .slice(0, widget.settings.limit);

  if (selectedSections.length === 0) {
    return (
      <WidgetEmpty
        text="No weekly snapshot sections are selected. Configure this widget to add summaries."
        link={ROUTES.admin.metrics}
        label="Open Metrics"
      />
    );
  }

  return (
    <div className="weekly-snapshot-sections">
      {selectedSections.map((section) => {
        const display = weeklySectionDisplays[section.id];
        return (
          <Link className="weekly-snapshot-section" to={display.path} key={section.id}>
            <div className="weekly-snapshot-section__header">
              <strong>{section.title}</strong>
              <span aria-hidden="true">→</span>
            </div>
            <div className="weekly-snapshot-section__metrics">
              {display.metrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function WidgetBody({ widget }: { widget: DashboardWidgetInstance }) {
  switch (widget.type) {
    case "today-snapshot":
      return (
        <div className="dashboard-widget__snapshot-grid">
          <Link to={ROUTES.admin.jobs}><strong>0</strong><span>Today's Jobs</span></Link>
          <Link to={ROUTES.admin.calendar}><strong>0</strong><span>Schedule Requests</span></Link>
          <Link to={ROUTES.admin.notifications}><strong>0</strong><span>Urgent Messages</span></Link>
          <Link to={ROUTES.admin.expenses}><strong>0</strong><span>Expenses Over $500</span></Link>
          <Link to={ROUTES.admin.notifications}><strong>0</strong><span>Miscellaneous</span></Link>
        </div>
      );

    case "metrics":
      return (
        <div className="dashboard-widget__metric-grid">
          <div><strong>$0</strong><span>Revenue</span></div>
          <div><strong>$0</strong><span>Profit</span></div>
          <div><strong>0</strong><span>Completed Jobs</span></div>
          <div><strong>0%</strong><span>Estimate Conversion</span></div>
        </div>
      );

    case "quick-forms": {
      const selectedIds = widget.settings.selectedFormIds ?? defaultQuickFormIds;
      const formsById = new Map(formDefinitions.map((form) => [form.id, form]));
      const selectedForms = selectedIds
        .map((id) => formsById.get(id))
        .filter((form): form is (typeof formDefinitions)[number] => Boolean(form))
        .slice(0, widget.settings.limit);

      if (selectedForms.length === 0) {
        return <WidgetEmpty text="No quick forms are selected. Configure this widget to add forms." link={ROUTES.admin.forms} label="Open Forms Library" />;
      }

      return (
        <div className="dashboard-widget__links">
          {selectedForms.map((form) => (
            <Link key={form.id} to={form.path}>
              <span>{form.title}</span><span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      );
    }

    case "upcoming-jobs":
      return <WidgetEmpty text="Upcoming jobs will appear here once scheduling data is connected." link={ROUTES.admin.jobs} label="Open Jobs" />;
    case "weekly-snapshot":
      return <WeeklySnapshotBody widget={widget} />;
    case "open-estimates":
      return <WidgetEmpty text="No open estimates." link={ROUTES.admin.estimates} label="View Estimates" />;
    case "outstanding-expenses":
      return <WidgetEmpty text="No outstanding expenses." link={ROUTES.admin.expenses} label="View Expenses" />;
    case "notifications":
      return <WidgetEmpty text="No unread notifications." link={ROUTES.admin.notifications} label="View Notifications" />;
    case "recent-activity":
      return <WidgetEmpty text="Recent administrative activity will appear here." link={ROUTES.admin.history} label="Open History" />;
    case "business-health":
      return (
        <div className="dashboard-widget__business-list">
          <div><span>Landscaping</span><strong>Active</strong></div>
          <div><span>Transport</span><strong>Coming Soon</strong></div>
          <div><span>Productions</span><strong>Coming Soon</strong></div>
        </div>
      );
  }
}

function WidgetEmpty({ text, link, label }: { text: string; link: string; label: string }) {
  return (
    <div className="dashboard-widget__empty">
      <p>{text}</p>
      <Link to={link}>{label}</Link>
    </div>
  );
}

function DashboardWidget({
  widget,
  editing,
  dragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  onRemove,
  onDuplicate,
  onChangeType,
  onChangeSize,
  onConfigure
}: DashboardWidgetProps) {
  const definition = dashboardWidgetCatalog.find((item) => item.type === widget.type)!;
  const title = widget.settings.title?.trim() || definition.title;

  return (
    <article
      className={`dashboard-widget dashboard-widget--${widget.size}${dragging ? " dashboard-widget--dragging" : ""}`}
      draggable={editing}
      onDragStart={onDragStart}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDragEnd={onDragEnd}
    >
      <header className="dashboard-widget__header">
        <div>
          <p className="dashboard-widget__scope">
            {widget.settings.business === "all" ? "All businesses" : widget.settings.business}
            {" · "}{widget.settings.period}
          </p>
          <h3>{title}</h3>
        </div>
        {editing ? <span className="dashboard-widget__drag-handle" title="Drag to move">⋮⋮</span> : null}
      </header>

      {editing ? (
        <div className="dashboard-widget__editor">
          <label>
            <span>Widget</span>
            <select value={widget.type} onChange={(event) => onChangeType(event.target.value as DashboardWidgetType)}>
              {dashboardWidgetCatalog.map((item) => <option key={item.type} value={item.type}>{item.title}</option>)}
            </select>
          </label>
          <label>
            <span>Size</span>
            <select value={widget.size} onChange={(event) => onChangeSize(event.target.value as DashboardWidgetSize)}>
              {sizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <div className="dashboard-widget__editor-actions">
            <button type="button" onClick={onConfigure}>Configure</button>
            <button type="button" onClick={onDuplicate}>Duplicate</button>
            <button type="button" onClick={onRemove}>Remove</button>
          </div>
        </div>
      ) : null}

      <div className="dashboard-widget__body"><WidgetBody widget={widget} /></div>
    </article>
  );
}

export default DashboardWidget;
