import { useEffect, useState, type FormEvent } from "react";

import FormLinkCard from "../components/FormLinkCard";
import {
  deleteStoredForm,
  fetchStoredFormBlob,
  listStoredForms,
  uploadStoredForm,
  type StoredFormFile,
  type StoredFormScope
} from "../../services/api/forms";
import type { FormCategory, FormDefinition } from "../../shared/types/form";

const forms: FormDefinition[] = [
  {
    id: "service-request",
    title: "Service Request",
    description:
      "Collect a customer's requested service, preferred schedule, location, and project details.",
    path: "/admin/forms/service-request",
    category: "customer",
    availability: "planned",
    businessScope: "all"
  },
  {
    id: "estimate-request",
    title: "Estimate Request",
    description:
      "Capture the information needed to prepare a new customer estimate.",
    path: "/admin/forms/estimate-request",
    category: "customer",
    availability: "planned",
    businessScope: "all"
  },
  {
    id: "customer-intake",
    title: "Customer Intake",
    description:
      "Create a complete customer profile with contact, billing, and service information.",
    path: "/admin/forms/customer-intake",
    category: "customer",
    availability: "planned",
    businessScope: "all"
  },
  {
    id: "job-completion",
    title: "Job Completion Report",
    description:
      "Record work completed, materials used, issues found, and customer sign-off.",
    path: "/admin/forms/job-completion",
    category: "operations",
    availability: "planned",
    businessScope: "all"
  },
  {
    id: "incident-report",
    title: "Incident Report",
    description:
      "Document property damage, safety incidents, service disruptions, or other operational issues.",
    path: "/admin/forms/incident-report",
    category: "operations",
    availability: "planned",
    businessScope: "all"
  },
  {
    id: "vehicle-inspection",
    title: "Vehicle Inspection",
    description:
      "Complete pre-trip, post-trip, and maintenance inspection records for transport assets.",
    path: "/admin/forms/vehicle-inspection",
    category: "operations",
    availability: "planned",
    businessScope: "transport"
  },
  {
    id: "expense-submission",
    title: "Expense Submission",
    description:
      "Submit an expense with vendor, category, amount, notes, and receipt information.",
    path: "/admin/forms/expense-submission",
    category: "finance",
    availability: "planned",
    businessScope: "all"
  },
  {
    id: "purchase-request",
    title: "Purchase Request",
    description:
      "Request approval for tools, supplies, materials, equipment, or other purchases.",
    path: "/admin/forms/purchase-request",
    category: "finance",
    availability: "planned",
    businessScope: "all"
  },
  {
    id: "employee-onboarding",
    title: "Employee Onboarding",
    description:
      "Collect basic employment information and track onboarding requirements.",
    path: "/admin/forms/employee-onboarding",
    category: "internal",
    availability: "planned",
    businessScope: "all"
  },
  {
    id: "time-off-request",
    title: "Time-Off Request",
    description:
      "Submit and review employee leave requests with dates, reason, and approval status.",
    path: "/admin/forms/time-off-request",
    category: "internal",
    availability: "planned",
    businessScope: "all"
  }
];

const categoryLabels: Record<FormCategory, string> = {
  customer: "Customer Forms",
  operations: "Operations Forms",
  finance: "Financial Forms",
  internal: "Internal Forms"
};

const categoryDescriptions: Record<FormCategory, string> = {
  customer: "Forms used to collect customer, service, and estimate information.",
  operations: "Forms used to document field work, inspections, and incidents.",
  finance: "Forms used for expenses, purchases, and financial approvals.",
  internal: "Forms used for employees, administration, and internal workflows."
};

const scopeLabels: Record<StoredFormScope, string> = {
  all: "All Pioneer",
  landscaping: "Pioneer Landscaping",
  transport: "Pioneer Transport",
  productions: "Pioneer Productions"
};

const categories: FormCategory[] = [
  "customer",
  "operations",
  "finance",
  "internal"
];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function Forms() {
  const [storedForms, setStoredForms] = useState<StoredFormFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FormCategory>("operations");
  const [businessScope, setBusinessScope] = useState<StoredFormScope>("landscaping");
  const [version, setVersion] = useState("1.0");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  async function loadStoredForms() {
    setLoading(true);
    setError("");
    try {
      const result = await listStoredForms();
      setStoredForms(result.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load stored forms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStoredForms();
  }, []);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!file) {
      setError("Choose a PDF file to upload.");
      return;
    }
    if (file.type && file.type !== "application/pdf") {
      setError("Only PDF files can be stored in the forms library.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("PDF files are limited to 15 MB.");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadStoredForm({
        title: title.trim(),
        description: description.trim(),
        category,
        businessScope,
        version: version.trim() || "1.0",
        file
      });
      setStoredForms((current) => [result.data, ...current]);
      setTitle("");
      setDescription("");
      setVersion("1.0");
      setFile(null);
      setFileInputKey((current) => current + 1);
      setNotice(`${result.data.title} was added to the forms library.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload the form.");
    } finally {
      setUploading(false);
    }
  }

  async function openStoredForm(form: StoredFormFile, download = false) {
    setBusyId(form.id);
    setError("");
    try {
      const blob = await fetchStoredFormBlob(form.id);
      const url = URL.createObjectURL(blob);

      if (download) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = form.originalFilename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Unable to open the stored form.");
    } finally {
      setBusyId("");
    }
  }

  async function removeStoredForm(form: StoredFormFile) {
    if (!window.confirm(`Remove "${form.title}" from the forms library?`)) return;

    setBusyId(form.id);
    setError("");
    setNotice("");
    try {
      await deleteStoredForm(form.id);
      setStoredForms((current) => current.filter((item) => item.id !== form.id));
      setNotice(`${form.title} was removed from the forms library.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to remove the stored form.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="admin-forms-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-page-heading__eyebrow">Resources</p>
          <h2 className="admin-page-heading__title">Forms Library</h2>
          <p className="admin-page-heading__description">
            Store finished PDF masters for every Pioneer division and keep planned digital forms in one directory.
          </p>
        </div>
      </div>

      {error ? <div className="forms-feedback forms-feedback--error" role="alert">{error}</div> : null}
      {notice ? <div className="forms-feedback forms-feedback--success" role="status">{notice}</div> : null}

      <section className="forms-upload-panel">
        <div className="forms-upload-panel__intro">
          <p className="forms-section__eyebrow">PDF Storage</p>
          <h3>Add a form to the library</h3>
          <p>Upload the blank master copy. PDFs are stored in the Pioneer database and limited to 15 MB each.</p>
        </div>

        <form className="forms-upload-form" onSubmit={handleUpload}>
          <label>
            <span>Form name</span>
            <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Mileage Log" />
          </label>
          <label>
            <span>Division</span>
            <select value={businessScope} onChange={(event) => setBusinessScope(event.target.value as StoredFormScope)}>
              {Object.entries(scopeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as FormCategory)}>
              {categories.map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}
            </select>
          </label>
          <label>
            <span>Version</span>
            <input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="1.0" />
          </label>
          <label className="forms-upload-form__wide">
            <span>Description</span>
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional note about when this form is used" />
          </label>
          <label className="forms-upload-form__wide">
            <span>PDF file</span>
            <input
              key={fileInputKey}
              required
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                if (nextFile && !title.trim()) setTitle(nextFile.name.replace(/\.pdf$/i, ""));
              }}
            />
          </label>
          <div className="forms-upload-form__actions">
            <button className="forms-primary-button" type="submit" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload PDF"}
            </button>
          </div>
        </form>
      </section>

      <section className="forms-summary">
        <div>
          <strong>{storedForms.length}</strong>
          <span>Stored PDFs</span>
        </div>
        <div>
          <strong>{categories.length}</strong>
          <span>Form Categories</span>
        </div>
        <div>
          <strong>{forms.length}</strong>
          <span>Planned Digital Forms</span>
        </div>
      </section>

      <section className="forms-section forms-stored-section">
        <div className="forms-section__heading">
          <div>
            <p className="forms-section__eyebrow">Master Copies</p>
            <h3>Stored Forms</h3>
            <p>Preview or download the current blank PDF masters kept in the library.</p>
          </div>
          <span className="forms-section__count">{storedForms.length}</span>
        </div>

        {loading ? <div className="forms-empty-state">Loading stored forms…</div> : null}
        {!loading && storedForms.length === 0 ? (
          <div className="forms-empty-state">No PDF masters have been uploaded yet.</div>
        ) : null}
        {!loading && storedForms.length > 0 ? (
          <div className="stored-forms-grid">
            {storedForms.map((form) => (
              <article className="stored-form-card" key={form.id}>
                <div className="stored-form-card__header">
                  <span>{scopeLabels[form.businessScope]}</span>
                  <strong>v{form.version}</strong>
                </div>
                <h4>{form.title}</h4>
                <p>{form.description || form.originalFilename}</p>
                <dl>
                  <div><dt>Category</dt><dd>{categoryLabels[form.category]}</dd></div>
                  <div><dt>File</dt><dd>{formatFileSize(form.sizeBytes)}</dd></div>
                  <div><dt>Uploaded</dt><dd>{formatDate(form.createdAt)}</dd></div>
                </dl>
                <div className="stored-form-card__actions">
                  <button type="button" disabled={busyId === form.id} onClick={() => void openStoredForm(form)}>Preview</button>
                  <button type="button" disabled={busyId === form.id} onClick={() => void openStoredForm(form, true)}>Download</button>
                  <button className="stored-form-card__delete" type="button" disabled={busyId === form.id} onClick={() => void removeStoredForm(form)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <div className="forms-sections forms-planned-sections">
        {categories.map((plannedCategory) => {
          const categoryForms = forms.filter((form) => form.category === plannedCategory);

          return (
            <section className="forms-section" key={plannedCategory}>
              <div className="forms-section__heading">
                <div>
                  <p className="forms-section__eyebrow">Planned Digital Forms</p>
                  <h3>{categoryLabels[plannedCategory]}</h3>
                  <p>{categoryDescriptions[plannedCategory]}</p>
                </div>
                <span className="forms-section__count">{categoryForms.length}</span>
              </div>

              <div className="forms-grid">
                {categoryForms.map((form) => <FormLinkCard form={form} key={form.id} />)}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

export default Forms;
