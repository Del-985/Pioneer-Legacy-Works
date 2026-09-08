import type { ChangeEvent } from "react";

import {
  defaultQuickFormIds,
  formDefinitions
} from "../../shared/constants/forms";
import {
  defaultWeeklySnapshotSectionIds,
  weeklySnapshotSections
} from "../../shared/constants/weeklySnapshot";
import type {
  DashboardWidgetInstance,
  WeeklySnapshotSectionId
} from "../../shared/types/dashboard";

interface DashboardWidgetSettingsProps {
  widget: DashboardWidgetInstance;
  onChange: (widget: DashboardWidgetInstance) => void;
  onClose: () => void;
}

function DashboardWidgetSettings({
  widget,
  onChange,
  onClose
}: DashboardWidgetSettingsProps) {
  const updateSetting = <K extends keyof DashboardWidgetInstance["settings"]>(
    key: K,
    value: DashboardWidgetInstance["settings"][K]
  ) => {
    onChange({
      ...widget,
      settings: {
        ...widget.settings,
        [key]: value
      }
    });
  };

  const handleLimit = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    updateSetting(
      "limit",
      Number.isFinite(nextValue)
        ? Math.max(1, Math.min(20, nextValue))
        : 5
    );
  };

  const selectedFormIds =
    widget.settings.selectedFormIds ?? defaultQuickFormIds;

  const selectedWeeklySectionIds =
    widget.settings.selectedWeeklySectionIds ??
    defaultWeeklySnapshotSectionIds;

  const toggleForm = (formId: string) => {
    updateSetting(
      "selectedFormIds",
      selectedFormIds.includes(formId)
        ? selectedFormIds.filter((id) => id !== formId)
        : [...selectedFormIds, formId]
    );
  };

  const moveForm = (formId: string, direction: -1 | 1) => {
    const currentIndex = selectedFormIds.indexOf(formId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= selectedFormIds.length) return;

    const nextIds = [...selectedFormIds];
    [nextIds[currentIndex], nextIds[targetIndex]] = [
      nextIds[targetIndex],
      nextIds[currentIndex]
    ];
    updateSetting("selectedFormIds", nextIds);
  };

  const toggleWeeklySection = (sectionId: WeeklySnapshotSectionId) => {
    updateSetting(
      "selectedWeeklySectionIds",
      selectedWeeklySectionIds.includes(sectionId)
        ? selectedWeeklySectionIds.filter((id) => id !== sectionId)
        : [...selectedWeeklySectionIds, sectionId]
    );
  };

  const moveWeeklySection = (
    sectionId: WeeklySnapshotSectionId,
    direction: -1 | 1
  ) => {
    const currentIndex = selectedWeeklySectionIds.indexOf(sectionId);
    const targetIndex = currentIndex + direction;
    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= selectedWeeklySectionIds.length
    ) return;

    const nextIds = [...selectedWeeklySectionIds];
    [nextIds[currentIndex], nextIds[targetIndex]] = [
      nextIds[targetIndex],
      nextIds[currentIndex]
    ];
    updateSetting("selectedWeeklySectionIds", nextIds);
  };

  return (
    <div
      className="dashboard-settings-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="dashboard-settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-widget-settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dashboard-settings-dialog__header">
          <div>
            <p>Widget Settings</p>
            <h2 id="dashboard-widget-settings-title">
              Configure dashboard widget
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close widget settings">×</button>
        </div>

        <div className="dashboard-settings-dialog__fields">
          <label>
            <span>Custom title</span>
            <input
              type="text"
              value={widget.settings.title ?? ""}
              placeholder="Use default title"
              onChange={(event) => updateSetting("title", event.target.value)}
            />
          </label>

          <label>
            <span>Business scope</span>
            <select
              value={widget.settings.business}
              onChange={(event) =>
                updateSetting(
                  "business",
                  event.target.value as DashboardWidgetInstance["settings"]["business"]
                )
              }
            >
              <option value="all">All businesses</option>
              <option value="outdoor-services">Outdoor Services</option>
              <option value="transport">Transport</option>
              <option value="productions">Productions</option>
            </select>
          </label>

          <label>
            <span>Time period</span>
            <select
              value={widget.settings.period}
              onChange={(event) =>
                updateSetting(
                  "period",
                  event.target.value as DashboardWidgetInstance["settings"]["period"]
                )
              }
            >
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
          </label>

          <label>
            <span>Maximum items</span>
            <input
              type="number"
              min="1"
              max="20"
              value={widget.settings.limit}
              onChange={handleLimit}
            />
          </label>

          {widget.type === "quick-forms" ? (
            <section className="dashboard-settings-dialog__form-picker">
              <div className="dashboard-settings-dialog__form-picker-heading">
                <div>
                  <span>Quick Forms</span>
                  <p>Choose and reorder the forms shown in this widget.</p>
                </div>
                <button type="button" onClick={() => updateSetting("selectedFormIds", [...defaultQuickFormIds])}>
                  Restore defaults
                </button>
              </div>

              <div className="dashboard-settings-dialog__form-options">
                {formDefinitions.map((form) => {
                  const isSelected = selectedFormIds.includes(form.id);
                  const selectedIndex = selectedFormIds.indexOf(form.id);
                  return (
                    <div className={`dashboard-form-option${isSelected ? " dashboard-form-option--selected" : ""}`} key={form.id}>
                      <label>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleForm(form.id)} />
                        <span><strong>{form.title}</strong><small>{form.category}</small></span>
                      </label>
                      {isSelected ? (
                        <div className="dashboard-form-option__order">
                          <button type="button" disabled={selectedIndex === 0} onClick={() => moveForm(form.id, -1)} aria-label={`Move ${form.title} up`}>↑</button>
                          <button type="button" disabled={selectedIndex === selectedFormIds.length - 1} onClick={() => moveForm(form.id, 1)} aria-label={`Move ${form.title} down`}>↓</button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {widget.type === "weekly-snapshot" ? (
            <section className="dashboard-settings-dialog__form-picker">
              <div className="dashboard-settings-dialog__form-picker-heading">
                <div>
                  <span>Weekly Snapshot Sections</span>
                  <p>Choose which summaries appear and arrange their order.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateSetting(
                      "selectedWeeklySectionIds",
                      [...defaultWeeklySnapshotSectionIds]
                    )
                  }
                >
                  Restore defaults
                </button>
              </div>

              <div className="dashboard-settings-dialog__form-options">
                {weeklySnapshotSections.map((section) => {
                  const isSelected = selectedWeeklySectionIds.includes(section.id);
                  const selectedIndex = selectedWeeklySectionIds.indexOf(section.id);
                  return (
                    <div className={`dashboard-form-option${isSelected ? " dashboard-form-option--selected" : ""}`} key={section.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleWeeklySection(section.id)}
                        />
                        <span>
                          <strong>{section.title}</strong>
                          <small>{section.description}</small>
                        </span>
                      </label>
                      {isSelected ? (
                        <div className="dashboard-form-option__order">
                          <button type="button" disabled={selectedIndex === 0} onClick={() => moveWeeklySection(section.id, -1)} aria-label={`Move ${section.title} up`}>↑</button>
                          <button type="button" disabled={selectedIndex === selectedWeeklySectionIds.length - 1} onClick={() => moveWeeklySection(section.id, 1)} aria-label={`Move ${section.title} down`}>↓</button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        <div className="dashboard-settings-dialog__footer">
          <button type="button" onClick={onClose}>Done</button>
        </div>
      </section>
    </div>
  );
}

export default DashboardWidgetSettings;
