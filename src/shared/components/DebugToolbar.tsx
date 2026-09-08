import { useState } from "react";

interface DebugLink {
  label: string;
  path: string;
  matchPrefix?: boolean;
}

interface DebugSection {
  label: string;
  links: DebugLink[];
}

const outdoorServicesDomain = "https://pioneeroutdoorservices.com";

const sections: DebugSection[] = [
  {
    label: "Apps",
    links: [
      { label: "Website", path: "/", matchPrefix: false },
      { label: "Outdoor Services", path: outdoorServicesDomain },
      { label: "Transport", path: "/transport", matchPrefix: true },
      { label: "Productions", path: "/productions", matchPrefix: true },
      { label: "Admin", path: "/admin", matchPrefix: true }
    ]
  },
  {
    label: "Website",
    links: [
      { label: "Home", path: "/" },
      { label: "Companies", path: "/companies" },
      { label: "About", path: "/about" },
      { label: "Contact", path: "/contact" }
    ]
  },
  {
    label: "Outdoor Services",
    links: [
      { label: "Home", path: outdoorServicesDomain },
      { label: "Services", path: `${outdoorServicesDomain}/services` },
      { label: "Gallery", path: `${outdoorServicesDomain}/gallery` },
      { label: "Quote", path: `${outdoorServicesDomain}/quote` },
      { label: "Request", path: `${outdoorServicesDomain}/request` },
      { label: "Contact", path: `${outdoorServicesDomain}/contact` },
      { label: "Login", path: `${outdoorServicesDomain}/login` },
      { label: "Register", path: `${outdoorServicesDomain}/register` },
      { label: "Forgot Password", path: `${outdoorServicesDomain}/forgot-password` },
      { label: "Reset Password", path: `${outdoorServicesDomain}/reset-password` },
      { label: "Verify Email", path: `${outdoorServicesDomain}/verify-email` },
      { label: "Customer Dashboard", path: `${outdoorServicesDomain}/account` }
    ]
  },
  {
    label: "Admin",
    links: [
      { label: "Overview", path: "/admin/overview" },
      { label: "Calendar", path: "/admin/calendar" },
      { label: "Customers", path: "/admin/customers" },
      { label: "Contacts", path: "/admin/contacts" },
      { label: "Estimates", path: "/admin/estimates" },
      { label: "Jobs", path: "/admin/jobs" },
      { label: "Expenses", path: "/admin/expenses" },
      { label: "Forms", path: "/admin/forms" },
      { label: "History", path: "/admin/history" },
      { label: "Metrics", path: "/admin/metrics" },
      { label: "Notifications", path: "/admin/notifications" },
      { label: "Settings", path: "/admin/settings" }
    ]
  }
];

function isLinkActive(link: DebugLink, currentPath: string) {
  if (link.path.startsWith("http")) return false;
  if (link.path === "/") return currentPath === "/";
  if (link.matchPrefix) {
    return currentPath === link.path || currentPath.startsWith(`${link.path}/`);
  }
  return currentPath === link.path;
}

function DebugToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = window.location.pathname;

  return (
    <aside
      className={`debug-toolbar${isOpen ? " debug-toolbar--open" : ""}`}
      aria-label="Development navigation"
    >
      <button
        className="debug-toolbar__toggle"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span>DEBUG NAV</span>
        <span aria-hidden="true">{isOpen ? "×" : "↑"}</span>
      </button>

      {isOpen ? (
        <div className="debug-toolbar__content">
          {sections.map((section) => (
            <section className="debug-toolbar__section" key={section.label}>
              <h2 className="debug-toolbar__heading">{section.label}</h2>
              <nav className="debug-toolbar__links" aria-label={`${section.label} debug links`}>
                {section.links.map((link) => (
                  <a
                    className={`debug-toolbar__link${
                      isLinkActive(link, currentPath)
                        ? " debug-toolbar__link--active"
                        : ""
                    }`}
                    href={link.path}
                    key={link.path}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </section>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

export default DebugToolbar;
