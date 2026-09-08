import { useMemo, useState } from "react";

import ContactDetail from "../components/ContactDetail";
import ContactFilters from "../components/ContactFilters";
import ContactForm from "../components/ContactForm";
import ContactTable from "../components/ContactTable";
import type { BusinessSlug } from "../../shared/types/business";
import type {
  ContactCategory,
  ContactRecord,
  ContactStatus,
  NewContactInput
} from "../../shared/types/contact";

const initialContacts: ContactRecord[] = [
  {
    id: "contact-1",
    business: "outdoor-services",
    firstName: "Mason",
    lastName: "Reed",
    company: "Northshore Materials",
    title: "Account Manager",
    category: "vendor",
    status: "active",
    email: "mason@example.com",
    phone: "985-555-0142",
    address: "1200 Industrial Drive",
    city: "Franklinton",
    state: "LA",
    postalCode: "70438",
    notes: "Primary aggregate and landscape-material contact.",
    createdAt: "2026-07-01T12:00:00Z",
    updatedAt: "2026-07-12T12:00:00Z"
  },
  {
    id: "contact-2",
    business: "shared",
    firstName: "Dana",
    lastName: "Brooks",
    company: "Washington Parish Permit Office",
    title: "Permit Coordinator",
    category: "government",
    status: "active",
    email: "dana@example.gov",
    phone: "985-555-0188",
    notes: "General permitting and inspection contact.",
    createdAt: "2026-07-03T12:00:00Z",
    updatedAt: "2026-07-10T12:00:00Z"
  },
  {
    id: "contact-3",
    business: "transport",
    firstName: "Caleb",
    lastName: "Turner",
    company: "Turner Fleet Repair",
    category: "contractor",
    status: "inactive",
    phone: "985-555-0119",
    createdAt: "2026-06-18T12:00:00Z",
    updatedAt: "2026-07-05T12:00:00Z"
  }
];

function Contacts() {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedContactId, setSelectedContactId] = useState(initialContacts[0]?.id);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [business, setBusiness] = useState<BusinessSlug | "shared" | "all">("all");
  const [category, setCategory] = useState<ContactCategory | "all">("all");
  const [status, setStatus] = useState<ContactStatus | "all">("all");

  const filteredContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return contacts.filter((contact) => {
      const searchable = [
        contact.firstName,
        contact.lastName,
        contact.company,
        contact.email,
        contact.phone
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedSearch || searchable.includes(normalizedSearch)) &&
        (business === "all" || contact.business === business) &&
        (category === "all" || contact.category === category) &&
        (status === "all" || contact.status === status)
      );
    });
  }, [contacts, search, business, category, status]);

  const selectedContact = contacts.find(
    (contact) => contact.id === selectedContactId
  );

  const addContact = (input: NewContactInput) => {
    const timestamp = new Date().toISOString();
    const contact: ContactRecord = {
      ...input,
      id: `contact-${Date.now()}`,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setContacts((current) => [contact, ...current]);
    setSelectedContactId(contact.id);
    setShowForm(false);
  };

  return (
    <section className="admin-contacts-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-page-heading__eyebrow">Directory</p>
          <h2 className="admin-page-heading__title">Contacts</h2>
          <p className="admin-page-heading__description">
            Manage vendors, employees, contractors, partners, and other operational contacts.
          </p>
        </div>

        <button className="contacts-page__add-button" type="button" onClick={() => setShowForm(true)}>
          Add Contact
        </button>
      </div>

      <ContactFilters
        search={search}
        business={business}
        category={category}
        status={status}
        onSearchChange={setSearch}
        onBusinessChange={setBusiness}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
      />

      <div className="contacts-page__layout">
        <ContactTable
          contacts={filteredContacts}
          selectedContactId={selectedContactId}
          onSelectContact={setSelectedContactId}
        />
        <ContactDetail contact={selectedContact} />
      </div>

      {showForm ? (
        <div className="contact-form-overlay" role="presentation">
          <ContactForm onSubmit={addContact} onCancel={() => setShowForm(false)} />
        </div>
      ) : null}
    </section>
  );
}

export default Contacts;
