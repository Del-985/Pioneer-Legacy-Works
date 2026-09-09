const API_BASE_URL = "https://api.pioneerlegacyworks.com";
const SITE_KEY = "pioneer-legacy-works";

const companyGrid = document.querySelector("#company-grid");
const companyStatus = document.querySelector("#company-status");
const contactDetails = document.querySelector("#contact-details");
const backendStatus = document.querySelector("#backend-status");
const currentYear = document.querySelector("#current-year");
const navToggle = document.querySelector(".nav-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

function setBackendState(state, message) {
  if (!backendStatus) return;
  backendStatus.dataset.state = state;
  backendStatus.textContent = message;
}

async function fetchPublicData(path) {
  const response = await fetch(`${API_BASE_URL}/api/public/sites/${SITE_KEY}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const body = await response.json();
      message = body?.error?.message || message;
    } catch {
      // Keep the status-based message when the API response is not JSON.
    }

    throw new Error(message);
  }

  const body = await response.json();
  return body.data;
}

function updateSiteProfile(site) {
  if (!site) return;

  const brandName = site.profile?.brandName || site.name || "Pioneer Legacy Works";
  const tagline = site.profile?.tagline;
  const description = site.profile?.description;

  document.querySelectorAll("[data-brand-name]").forEach((element) => {
    element.textContent = brandName;
  });

  const taglineElement = document.querySelector("[data-site-tagline]");
  if (tagline && taglineElement) {
    taglineElement.textContent = tagline;
  }

  const descriptionElement = document.querySelector("[data-site-description]");
  if (description && descriptionElement) {
    descriptionElement.textContent = description;
  }

  document.title = brandName;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (description && metaDescription) {
    metaDescription.setAttribute("content", description);
  }

  renderContactDetails(site.profile);
}

function renderContactDetails(profile = {}) {
  if (!contactDetails) return;

  contactDetails.replaceChildren();

  const details = [];

  if (profile.contactEmail) {
    details.push({
      label: "Email",
      value: profile.contactEmail,
      href: `mailto:${profile.contactEmail}`,
    });
  }

  if (profile.contactPhone) {
    details.push({
      label: "Phone",
      value: profile.contactPhone,
      href: `tel:${profile.contactPhone.replace(/[^+\d]/g, "")}`,
    });
  }

  if (details.length === 0) {
    const placeholder = document.createElement("p");
    placeholder.className = "contact-placeholder";
    placeholder.textContent = "Contact information will appear here when published.";
    contactDetails.append(placeholder);
    return;
  }

  details.forEach((detail) => {
    const item = document.createElement("div");
    item.className = "contact-item";

    const label = document.createElement("span");
    label.textContent = detail.label;

    const link = document.createElement("a");
    link.href = detail.href;
    link.textContent = detail.value;

    item.append(label, link);
    contactDetails.append(item);
  });
}

function getCompanyUrl(company) {
  const candidates = [
    company.websiteUrl,
    company.primaryHostname ? `https://${company.primaryHostname}` : null,
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.href;
      }
    } catch {
      // Ignore invalid URLs and continue to the next candidate.
    }
  }

  return null;
}

function renderCompanies(companies) {
  if (!companyGrid) return;

  companyGrid.replaceChildren();
  companyGrid.setAttribute("aria-busy", "false");

  if (!Array.isArray(companies) || companies.length === 0) {
    const emptyCard = document.createElement("article");
    emptyCard.className = "company-card company-empty";

    const heading = document.createElement("h3");
    heading.textContent = "More from Pioneer soon";

    const copy = document.createElement("p");
    copy.textContent = "Published operating-company information will appear here as it becomes available.";

    emptyCard.append(heading, copy);
    companyGrid.append(emptyCard);
    return;
  }

  companies.forEach((company) => {
    const card = document.createElement("article");
    card.className = "company-card";

    const heading = document.createElement("h3");
    heading.textContent = company.name || company.slug || "Pioneer company";

    const description = document.createElement("p");
    description.textContent = company.description || "Part of the Pioneer Legacy Works family of operating companies.";

    card.append(heading, description);

    const companyUrl = getCompanyUrl(company);
    if (companyUrl) {
      const link = document.createElement("a");
      link.href = companyUrl;
      link.textContent = "Visit company";
      link.setAttribute("aria-label", `Visit ${heading.textContent}`);
      card.append(link);
    }

    companyGrid.append(card);
  });
}

async function loadHomepage() {
  setBackendState("connecting", "Connecting to Pioneer platform…");

  const [siteResult, companiesResult] = await Promise.allSettled([
    fetchPublicData(""),
    fetchPublicData("/business-units"),
  ]);

  if (siteResult.status === "fulfilled") {
    updateSiteProfile(siteResult.value);
  } else {
    console.warn("Unable to load public site profile:", siteResult.reason);
  }

  if (companiesResult.status === "fulfilled") {
    renderCompanies(companiesResult.value);
    if (companyStatus) companyStatus.textContent = "";
  } else {
    console.warn("Unable to load public business units:", companiesResult.reason);
    renderCompanies([]);
    if (companyStatus) {
      companyStatus.textContent = "Live company information is temporarily unavailable.";
    }
  }

  const connected = siteResult.status === "fulfilled" || companiesResult.status === "fulfilled";
  setBackendState(
    connected ? "connected" : "offline",
    connected ? "Pioneer platform connected" : "Live site data temporarily unavailable"
  );
}

function initializeNavigation() {
  if (!navToggle || !primaryNavigation) return;

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNavigation.classList.toggle("is-open", !isOpen);
  });

  primaryNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      primaryNavigation.classList.remove("is-open");
    });
  });
}

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

initializeNavigation();
loadHomepage();
