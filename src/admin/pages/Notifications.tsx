import { useMemo, useState } from "react";

import NotificationDetail from "../components/NotificationDetail";
import NotificationFilters from "../components/NotificationFilters";
import NotificationList from "../components/NotificationList";
import { ROUTES } from "../../shared/constants/routes";
import type { BusinessSlug } from "../../shared/types/business";
import type {
  AdminNotification,
  NotificationCategory,
  NotificationPriority
} from "../../shared/types/notification";

const initialNotifications: AdminNotification[] = [
  {
    id: "notification-1",
    business: "outdoor-services",
    category: "schedule",
    priority: "urgent",
    title: "Schedule request needs review",
    message:
      "A customer requested a landscaping estimate for tomorrow morning. Review the request before the requested time window closes.",
    createdAt: "2026-07-15T08:20:00",
    read: false,
    archived: false,
    actionLabel: "Open Calendar",
    actionPath: ROUTES.admin.calendar,
    sourceName: "Website scheduling form"
  },
  {
    id: "notification-2",
    business: "outdoor-services",
    category: "expense",
    priority: "high",
    title: "Expense over $500 recorded",
    message:
      "A $742.18 equipment repair expense was entered and is awaiting approval.",
    createdAt: "2026-07-15T07:45:00",
    read: false,
    archived: false,
    actionLabel: "Review Expense",
    actionPath: ROUTES.admin.expenses,
    sourceName: "Expense module"
  },
  {
    id: "notification-3",
    category: "system",
    priority: "normal",
    title: "Admin modules updated",
    message:
      "Calendar, customers, contacts, expenses, and metrics are now available in the admin panel.",
    createdAt: "2026-07-14T18:10:00",
    read: true,
    archived: false,
    sourceName: "Pioneer administration"
  },
  {
    id: "notification-4",
    business: "transport",
    category: "message",
    priority: "normal",
    title: "New transport inquiry",
    message:
      "A prospective commercial customer submitted a general transport service inquiry.",
    createdAt: "2026-07-14T15:35:00",
    read: false,
    archived: false,
    actionLabel: "Open Contacts",
    actionPath: ROUTES.admin.contacts,
    sourceName: "Contact form"
  },
  {
    id: "notification-5",
    business: "productions",
    category: "customer",
    priority: "low",
    title: "Customer record updated",
    message:
      "A productions customer record was updated with a new phone number and preferred contact method.",
    createdAt: "2026-07-13T11:05:00",
    read: true,
    archived: true,
    actionLabel: "Open Customers",
    actionPath: ROUTES.admin.customers,
    sourceName: "Customer module"
  }
];

function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedId, setSelectedId] = useState(initialNotifications[0]?.id);
  const [search, setSearch] = useState("");
  const [business, setBusiness] = useState<BusinessSlug | "all">("all");
  const [category, setCategory] = useState<NotificationCategory | "all">(
    "all"
  );
  const [priority, setPriority] = useState<NotificationPriority | "all">(
    "all"
  );
  const [state, setState] = useState<
    "all" | "unread" | "read" | "archived"
  >("all");

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !normalizedSearch ||
        notification.title.toLowerCase().includes(normalizedSearch) ||
        notification.message.toLowerCase().includes(normalizedSearch) ||
        notification.sourceName?.toLowerCase().includes(normalizedSearch);

      const matchesBusiness =
        business === "all" || notification.business === business;
      const matchesCategory =
        category === "all" || notification.category === category;
      const matchesPriority =
        priority === "all" || notification.priority === priority;
      const matchesState =
        state === "archived"
          ? notification.archived
          : !notification.archived &&
            (state === "all" ||
              (state === "read" && notification.read) ||
              (state === "unread" && !notification.read));

      return (
        matchesSearch &&
        matchesBusiness &&
        matchesCategory &&
        matchesPriority &&
        matchesState
      );
    });
  }, [notifications, search, business, category, priority, state]);

  const selectedNotification = notifications.find(
    (notification) => notification.id === selectedId
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read && !notification.archived
  ).length;
  const urgentCount = notifications.filter(
    (notification) =>
      notification.priority === "urgent" && !notification.archived
  ).length;
  const archivedCount = notifications.filter(
    (notification) => notification.archived
  ).length;

  const toggleRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: !notification.read }
          : notification
      )
    );
  };

  const toggleArchive = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, archived: !notification.archived }
          : notification
      )
    );
  };

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
  };

  return (
    <section className="admin-notifications-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-page-heading__eyebrow">Communication</p>
          <h2 className="admin-page-heading__title">Notifications</h2>
          <p className="admin-page-heading__description">
            Review urgent alerts, customer messages, operational updates, and
            system activity across Pioneer Enterprises.
          </p>
        </div>

        <button
          className="notifications-page__mark-all"
          type="button"
          onClick={markAllRead}
        >
          Mark All Read
        </button>
      </div>

      <div className="notification-summary">
        <article>
          <span>Unread</span>
          <strong>{unreadCount}</strong>
        </article>
        <article>
          <span>Urgent</span>
          <strong>{urgentCount}</strong>
        </article>
        <article>
          <span>Archived</span>
          <strong>{archivedCount}</strong>
        </article>
        <article>
          <span>Total</span>
          <strong>{notifications.length}</strong>
        </article>
      </div>

      <NotificationFilters
        search={search}
        business={business}
        category={category}
        priority={priority}
        state={state}
        onSearchChange={setSearch}
        onBusinessChange={setBusiness}
        onCategoryChange={setCategory}
        onPriorityChange={setPriority}
        onStateChange={setState}
      />

      <div className="notifications-page__layout">
        <section className="notifications-page__list-panel">
          <div className="notifications-page__panel-header">
            <div>
              <p>Inbox</p>
              <h3>{filteredNotifications.length} notifications</h3>
            </div>
          </div>

          <NotificationList
            notifications={filteredNotifications}
            selectedId={selectedId}
            onSelect={(notification) => {
              setSelectedId(notification.id);

              if (!notification.read) {
                toggleRead(notification.id);
              }
            }}
          />
        </section>

        <NotificationDetail
          notification={selectedNotification}
          onToggleRead={toggleRead}
          onArchive={toggleArchive}
        />
      </div>
    </section>
  );
}

export default Notifications;
