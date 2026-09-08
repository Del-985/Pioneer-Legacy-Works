import { useState } from "react";

import SettingsSection from "../components/SettingsSection";
import type { AdminSettings } from "../../shared/types/settings";

const initialSettings: AdminSettings = {
  organization: {
    organizationName: "Pioneer Legacy Works",
    supportEmail: "support@pioneerlegacyworks.com",
    supportPhone: "",
    timezone: "America/Chicago",
    dateFormat: "MM/DD/YYYY"
  },
  notifications: {
    emailNotifications: true,
    urgentAlerts: true,
    scheduleReminders: true,
    estimateUpdates: true,
    expenseAlerts: true
  },
  display: {
    theme: "system",
    compactTables: false,
    showBusinessLabels: true
  },
  system: {
    autoArchiveDays: 90,
    requireExpenseReceipts: true,
    highValueExpenseThreshold: 500
  }
};

function Settings() {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section className="admin-settings-page">
      <div className="admin-page-heading settings-page__heading">
        <div>
          <p className="admin-page-heading__eyebrow">Administration</p>
          <h2 className="admin-page-heading__title">Settings</h2>
          <p className="admin-page-heading__description">
            Configure organization details, notifications, display preferences, and system rules.
          </p>
        </div>

        <button className="settings-page__save" type="button" onClick={saveSettings}>
          {saved ? "Settings Saved" : "Save Changes"}
        </button>
      </div>

      <div className="settings-page__grid">
        <SettingsSection
          title="Organization"
          description="Core information used throughout the Pioneer administration system."
        >
          <div className="settings-fields settings-fields--two-column">
            <label>
              <span>Organization name</span>
              <input
                value={settings.organization.organizationName}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    organization: {
                      ...current.organization,
                      organizationName: event.target.value
                    }
                  }))
                }
              />
            </label>

            <label>
              <span>Support email</span>
              <input
                type="email"
                value={settings.organization.supportEmail}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    organization: {
                      ...current.organization,
                      supportEmail: event.target.value
                    }
                  }))
                }
              />
            </label>

            <label>
              <span>Support phone</span>
              <input
                type="tel"
                value={settings.organization.supportPhone}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    organization: {
                      ...current.organization,
                      supportPhone: event.target.value
                    }
                  }))
                }
              />
            </label>

            <label>
              <span>Timezone</span>
              <select
                value={settings.organization.timezone}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    organization: {
                      ...current.organization,
                      timezone: event.target.value
                    }
                  }))
                }
              >
                <option value="America/Chicago">Central Time</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </label>

            <label>
              <span>Date format</span>
              <select
                value={settings.organization.dateFormat}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    organization: {
                      ...current.organization,
                      dateFormat: event.target.value as AdminSettings["organization"]["dateFormat"]
                    }
                  }))
                }
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </label>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Notifications"
          description="Choose which operational events should trigger alerts."
        >
          <div className="settings-toggles">
            {[
              ["emailNotifications", "Email notifications", "Send administrative notifications by email."],
              ["urgentAlerts", "Urgent alerts", "Surface critical messages and failures immediately."],
              ["scheduleReminders", "Schedule reminders", "Remind staff about upcoming jobs and appointments."],
              ["estimateUpdates", "Estimate updates", "Notify when estimate statuses change."],
              ["expenseAlerts", "Expense alerts", "Alert when large or incomplete expenses are recorded."]
            ].map(([key, label, description]) => (
              <label className="settings-toggle" key={key}>
                <div>
                  <strong>{label}</strong>
                  <span>{description}</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications[key as keyof AdminSettings["notifications"]]}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      notifications: {
                        ...current.notifications,
                        [key]: event.target.checked
                      }
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </SettingsSection>

        <SettingsSection
          title="Display"
          description="Control how the administration interface is presented."
        >
          <div className="settings-fields">
            <label>
              <span>Theme</span>
              <select
                value={settings.display.theme}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    display: {
                      ...current.display,
                      theme: event.target.value as AdminSettings["display"]["theme"]
                    }
                  }))
                }
              >
                <option value="system">Use system setting</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>

          <div className="settings-toggles">
            <label className="settings-toggle">
              <div><strong>Compact tables</strong><span>Reduce row height in data-heavy modules.</span></div>
              <input
                type="checkbox"
                checked={settings.display.compactTables}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    display: { ...current.display, compactTables: event.target.checked }
                  }))
                }
              />
            </label>

            <label className="settings-toggle">
              <div><strong>Business labels</strong><span>Show division labels beside shared records.</span></div>
              <input
                type="checkbox"
                checked={settings.display.showBusinessLabels}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    display: { ...current.display, showBusinessLabels: event.target.checked }
                  }))
                }
              />
            </label>
          </div>
        </SettingsSection>

        <SettingsSection
          title="System Rules"
          description="Set operational thresholds and record-retention defaults."
        >
          <div className="settings-fields settings-fields--two-column">
            <label>
              <span>Auto-archive after</span>
              <div className="settings-input-suffix">
                <input
                  type="number"
                  min="1"
                  value={settings.system.autoArchiveDays}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      system: {
                        ...current.system,
                        autoArchiveDays: Number(event.target.value)
                      }
                    }))
                  }
                />
                <span>days</span>
              </div>
            </label>

            <label>
              <span>High-value expense threshold</span>
              <div className="settings-input-prefix">
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  value={settings.system.highValueExpenseThreshold}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      system: {
                        ...current.system,
                        highValueExpenseThreshold: Number(event.target.value)
                      }
                    }))
                  }
                />
              </div>
            </label>
          </div>

          <label className="settings-toggle">
            <div><strong>Require expense receipts</strong><span>Flag expenses that do not include receipt documentation.</span></div>
            <input
              type="checkbox"
              checked={settings.system.requireExpenseReceipts}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  system: {
                    ...current.system,
                    requireExpenseReceipts: event.target.checked
                  }
                }))
              }
            />
          </label>
        </SettingsSection>
      </div>

      <p className="settings-page__notice">
        Settings are stored in memory for now and will persist after the backend is connected.
      </p>
    </section>
  );
}

export default Settings;
