import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./styles/global.css";
import "./styles/home.css";
import "./styles/home-logo.css";
import "./styles/landscaping.css";
import "./styles/landscaping-pages.css";
import "./styles/landscaping-customer-pages.css";
import "./styles/landscaping-account.css";
import "./styles/landscaping-auth.css";
import "./styles/admin.css";
import "./styles/admin-business.css";
import "./styles/admin-auth.css";
import "./styles/dashboard-customizer.css";
import "./styles/dashboard-form-settings.css";
import "./styles/weekly-snapshot.css";
import "./styles/calendar.css";
import "./styles/customers.css";
import "./styles/contacts.css";
import "./styles/estimates.css";
import "./styles/jobs.css";
import "./styles/expenses.css";
import "./styles/forms.css";
import "./styles/history.css";
import "./styles/metrics.css";
import "./styles/notifications.css";
import "./styles/settings.css";
import "./styles/service-requests.css";
import "./styles/placeholders.css";
import "./styles/debug-toolbar.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Unable to start Pioneer Legacy Works: the root element with id="root" was not found.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
