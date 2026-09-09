const API_BASE_URL = "https://api.pioneerlegacyworks.com";
const SITE_KEY = "pioneer-legacy-works";

const companyGrid = document.querySelector("#company-grid");
const companyStatus = document.querySelector("#company-status");
const contactDetails = document.querySelector("#contact-details");
const contactForm = document.querySelector("#contact-form");
const contactFormStatus = document.querySelector("#contact-form-status");
const contactBusinessUnit = document.querySelector("#contact-business-unit");
const backendStatus = document.querySelector("#backend-status");
const currentYear = document.querySelector("#current-year");
const navToggle = document.querySelector(".nav-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

let publicCompanies = [];

function setBackendState(state, message) {
  if (!backendStatus) return;
  backendStatus.dataset.state = state;
  backendStatus.textContent = message;
}

function normalizeApiError(body, fallback) {
  if (!body || typeof body !== "object") return fallback;
  return body.error?.message || body.message || fallback;
}

async function requestPublicData(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/public/sites/${SITE_KEY}${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const isJson = (response.headers.get("content-type") || "").includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(normalizeApiError(body, `Request failed with status ${response.status}.`));
  }

  return body?.data;
}

function setText(selector, value) {
  if (typeof value !== "string" || !value.trim()) return;
  const element = document.querySelector(selector);
  if (element) element.textContent = value.trim();
}

function setAboutCopy(value) {
  const container = document.querySelector("[data-about-copy]");
  if (!container) return;

  let paragraphs = [];
  if (Array.isArray(value)) {
    paragraphs = value.filter((item) => typeof item === "string" && item.trim());
  } else if (typeof value === "string" && value.trim()) {
    paragraphs = value.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  }

  if (paragraphs.length === 0) return;

  container.replaceChildren();
  paragraphs.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    container.append(paragraph);
  });
}

function updateFavicon(url) {
  if (typeof url !== "string" || !url.trim()) return;

  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.append(favicon);
  }
  favicon.href = url;
}

function updateLogo(url, brandName) {
  const logo = document.querySelector("[data-site-logo]");
  if (!logo) return;

  if (typeof url === "string" && url.trim()) {
    logo.src = url;
    logo.alt = `${brandName} logo`;
    logo.hidden = false;
  } else {
    logo.removeAttribute("src");
    logo.alt = "";
    logo.hidden = true;
  }
}

function updateSiteProfile(site) {
  if (!site) return;

  const profile = site.profile || {};
  const metadata = profile.metadata && typeof profile.metadata === "object" ? profile.metadata : {};
  const brandName = profile.brandName || site.name || "Pioneer Legacy Works";
  const tagline = profile.tagline;
  const description = profile.description;

  document.querySelectorAll("[data-brand-name]").forEach((element) => {
    element.textContent = brandName;
  });

  setText("[data-site-tagline]", tagline);
  setText("[data-site-description]", description);
  setText("[data-hero-eyebrow]", metadata.heroEyebrow);
  setText("[data-hero-heading]", metadata.heroHeading);
  setText("[data-about-heading]", metadata.aboutHeading);
  setText("[data-companies-heading]", metadata.companiesHeading);
  setText("[data-companies-description]", metadata.companiesDescription);
  setText("[data-contact-heading]", metadata.contactHeading);
  setText("[data-contact-description]", metadata.contactDescription);
  setAboutCopy(metadata.aboutCopy);

  updateLogo(profile.logoUrl, brandName);
  updateFavicon(profile.faviconUrl);

  document.title = typeof metadata.pageTitle === "string" && metadata.pageTitle.trim()
    ? metadata.pageTitle.trim()
    : brandName;

  const metaDescription = document.querySelector('meta[name="description"]');
  const configuredDescription =
    typeof metadata.metaDescription === "string" && metadata.metaDescription.trim()
      ? metadata.metaDescription.trim()
      : description;

  if (configuredDescription && metaDescription) {
    metaDescription.setAttribute("content", configuredDescription);
  }

  renderContactDetails(profile);
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
    placeholder.textContent = "Use the form and we will route your message to the right Pioneer company.";
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

function getCompanyStatus(company) {
  const explicitStatus =
    typeof company.publicStatus === "string"
      ? company.publicStatus.toLowerCase().replace(/\s+/g, "_")
      : null;

  if (explicitStatus === "inactive") return "inactive";
  if (explicitStatus === "coming_soon" || explicitStatus === "coming-soon") return "coming-soon";
  if (explicitStatus === "active") return "active";

  return getCompanyUrl(company) ? "active" : "coming-soon";
}

function createCompanyCard(company) {
  const status = getCompanyStatus(company);
  if (status === "inactive") return null;

  const card = document.createElement("article");
  card.className = `company-card company-card-${status}`;

  const badge = document.createElement("span");
  badge.className = `company-status company-status-${status}`;
  badge.textContent = status === "active" ? "Active" : "Coming soon";

  const heading = document.createElement("h3");
  heading.textContent = company.name || company.slug || "Pioneer company";

  const description = document.createElement("p");
  description.textContent =
    company.description ||
    "Part of the Pioneer Legacy Works family of operating companies.";

  card.append(badge, heading, description);

  const companyUrl = getCompanyUrl(company);
  if (status === "active" && companyUrl) {
    const link = document.createElement("a");
    link.href = companyUrl;
    link.textContent = "Visit company";
    link.setAttribute("aria-label", `Visit ${heading.textContent}`);
    card.append(link);
  } else {
    const comingSoon = document.createElement("span");
    comingSoon.className = "company-card-note";
    comingSoon.textContent = "Website coming soon";
    card.append(comingSoon);
  }

  return card;
}

function renderCompanies(companies) {
  if (!companyGrid) return;

  publicCompanies = Array.isArray(companies)
    ? companies.filter((company) => getCompanyStatus(company) !== "inactive")
    : [];

  companyGrid.replaceChildren();
  companyGrid.setAttribute("aria-busy", "false");

  if (publicCompanies.length === 0) {
    const emptyCard = document.createElement("article");
    emptyCard.className = "company-card company-empty";

    const heading = document.createElement("h3");
    heading.textContent = "More from Pioneer soon";

    const copy = document.createElement("p");
    copy.textContent = "Published operating-company information will appear here as it becomes available.";

    emptyCard.append(heading, copy);
    companyGrid.append(emptyCard);
    populateBusinessUnitOptions([]);
    return;
  }

  publicCompanies.forEach((company) => {
    const card = createCompanyCard(company);
    if (card) companyGrid.append(card);
  });

  populateBusinessUnitOptions(publicCompanies);
}

function populateBusinessUnitOptions(companies) {
  if (!contactBusinessUnit) return;

  const currentValue = contactBusinessUnit.value;
  contactBusinessUnit.replaceChildren();

  const generalOption = document.createElement("option");
  generalOption.value = "";
  generalOption.textContent = "General / Pioneer Legacy Works";
  contactBusinessUnit.append(generalOption);

  companies.forEach((company) => {
    if (!company.slug) return;

    const option = document.createElement("option");
    option.value = company.slug;
    option.textContent = company.name || company.slug;
    contactBusinessUnit.append(option);
  });

  if ([...contactBusinessUnit.options].some((option) => option.value === currentValue)) {
    contactBusinessUnit.value = currentValue;
  }
}

function setContactFormStatus(state, message) {
  if (!contactFormStatus) return;
  contactFormStatus.dataset.state = state;
  contactFormStatus.textContent = message;
}

function createClientRequestId() {
  if (window.crypto?.randomUUID) {
    return `web:${window.crypto.randomUUID()}`;
  }

  return `web:${Date.now()}:${Math.random().toString(36).slice(2, 12)}`;
}

async function handleContactSubmit(event) {
  event.preventDefault();
  if (!contactForm) return;

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const businessUnitSlug = String(formData.get("businessUnitSlug") || "").trim();
  const website = String(formData.get("website") || "").trim();

  setContactFormStatus("", "");

  if (!name) {
    setContactFormStatus("error", "Enter your name.");
    document.querySelector("#contact-name")?.focus();
    return;
  }

  if (!email && !phone) {
    setContactFormStatus("error", "Provide either an email address or phone number.");
    document.querySelector("#contact-email")?.focus();
    return;
  }

  if (email && !document.querySelector("#contact-email")?.checkValidity()) {
    setContactFormStatus("error", "Enter a valid email address.");
    document.querySelector("#contact-email")?.focus();
    return;
  }

  if (message.length < 5) {
    setContactFormStatus("error", "Enter a message of at least 5 characters.");
    document.querySelector("#contact-message")?.focus();
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
  }

  try {
    await requestPublicData("/contact", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        phone,
        subject,
        message,
        businessUnitSlug,
        sourcePath: window.location.pathname,
        website,
        clientRequestId: createClientRequestId(),
      }),
    });

    contactForm.reset();
    setContactFormStatus("success", "Your message was sent. Pioneer will follow up using the contact information you provided.");
  } catch (error) {
    setContactFormStatus(
      "error",
      error instanceof Error ? error.message : "Your message could not be sent. Please try again."
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Send message";
    }
  }
}

async function loadHomepage() {
  setBackendState("connecting", "Connecting to Pioneer platform…");

  const [siteResult, companiesResult] = await Promise.allSettled([
    requestPublicData(""),
    requestPublicData("/business-units"),
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

function closeNavigation() {
  if (!navToggle || !primaryNavigation) return;
  navToggle.setAttribute("aria-expanded", "false");
  primaryNavigation.classList.remove("is-open");
}

function initializeNavigation() {
  if (!navToggle || !primaryNavigation) return;

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNavigation.classList.toggle("is-open", !isOpen);
  });

  primaryNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
      navToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      navToggle.getAttribute("aria-expanded") === "true" &&
      !navToggle.contains(event.target) &&
      !primaryNavigation.contains(event.target)
    ) {
      closeNavigation();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeNavigation();
  });
}

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

contactForm?.addEventListener("submit", handleContactSubmit);
initializeNavigation();
loadHomepage();
