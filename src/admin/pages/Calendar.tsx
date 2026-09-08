import { useMemo, useState } from "react";

import CalendarGrid from "../components/CalendarGrid";
import CalendarToolbar from "../components/CalendarToolbar";
import ScheduleEventCard from "../components/ScheduleEventCard";
import ScheduleRequestList from "../components/ScheduleRequestList";
import type { BusinessSlug } from "../../shared/types/business";
import type {
  ScheduleEvent,
  ScheduleRequest
} from "../../shared/types/schedule";

const mockEvents: ScheduleEvent[] = [
  {
    id: "event-1",
    business: "outdoor-services",
    title: "Driveway pressure washing",
    customerName: "Sample Customer",
    date: "2026-07-15",
    startTime: "08:00",
    endTime: "10:00",
    location: "Franklinton, LA",
    kind: "job",
    status: "scheduled"
  },
  {
    id: "event-2",
    business: "transport",
    title: "Equipment delivery",
    customerName: "Sample Commercial Client",
    date: "2026-07-17",
    startTime: "13:30",
    endTime: "15:00",
    location: "Bogalusa, LA",
    kind: "delivery",
    status: "approved"
  },
  {
    id: "event-3",
    business: "productions",
    title: "Project consultation",
    customerName: "Sample Production Client",
    date: "2026-07-22",
    startTime: "11:00",
    endTime: "12:00",
    location: "Remote",
    kind: "production",
    status: "scheduled"
  }
];

const mockRequests: ScheduleRequest[] = [
  {
    id: "request-1",
    business: "outdoor-services",
    customerName: "Example Homeowner",
    requestedDate: "2026-07-20",
    requestedTime: "09:00",
    requestType: "Landscaping estimate",
    location: "Washington Parish, LA",
    submittedAt: "2026-07-14T14:30:00",
    status: "pending"
  },
  {
    id: "request-2",
    business: "transport",
    customerName: "Example Business",
    requestedDate: "2026-07-24",
    requestType: "Regional delivery request",
    location: "Louisiana",
    submittedAt: "2026-07-14T15:15:00",
    status: "pending"
  }
];

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildCalendarDays(activeMonth: Date) {
  const year = activeMonth.getFullYear();
  const month = activeMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());
  const today = toDateString(new Date());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    const dateString = toDateString(date);

    return {
      key: dateString,
      date,
      dateString,
      isCurrentMonth: date.getMonth() === month,
      isToday: dateString === today
    };
  });
}

function Calendar() {
  const today = new Date();

  const [activeMonth, setActiveMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(toDateString(today));

  const [selectedBusiness, setSelectedBusiness] = useState<
    BusinessSlug | "all"
  >("all");

  const calendarDays = useMemo(
    () => buildCalendarDays(activeMonth),
    [activeMonth]
  );

  const visibleEvents = useMemo(() => {
    if (selectedBusiness === "all") {
      return mockEvents;
    }

    return mockEvents.filter(
      (event) => event.business === selectedBusiness
    );
  }, [selectedBusiness]);

  const visibleRequests = useMemo(() => {
    if (selectedBusiness === "all") {
      return mockRequests;
    }

    return mockRequests.filter(
      (request) => request.business === selectedBusiness
    );
  }, [selectedBusiness]);

  const selectedDateEvents = visibleEvents.filter(
    (event) => event.date === selectedDate
  );

  const monthLabel = activeMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

  const selectedDateLabel = new Date(
    `${selectedDate}T12:00:00`
  ).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const moveMonth = (amount: number) => {
    setActiveMonth(
      new Date(
        activeMonth.getFullYear(),
        activeMonth.getMonth() + amount,
        1
      )
    );
  };

  const returnToToday = () => {
    const currentDate = new Date();

    setActiveMonth(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      )
    );

    setSelectedDate(toDateString(currentDate));
  };

  return (
    <section className="admin-calendar-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-page-heading__eyebrow">Operations</p>

          <h2 className="admin-page-heading__title">
            Calendar & Scheduling
          </h2>

          <p className="admin-page-heading__description">
            Review scheduled work, select a date, and process pending
            scheduling requests across every Pioneer business.
          </p>
        </div>

        <button className="calendar-page__create-button" type="button">
          Add Schedule Entry
        </button>
      </div>

      <CalendarToolbar
        monthLabel={monthLabel}
        selectedBusiness={selectedBusiness}
        onBusinessChange={setSelectedBusiness}
        onPreviousMonth={() => moveMonth(-1)}
        onNextMonth={() => moveMonth(1)}
        onToday={returnToToday}
      />

      <div className="calendar-page__layout">
        <section className="calendar-page__main">
          <CalendarGrid
            days={calendarDays}
            events={visibleEvents}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />

          <section className="selected-day-panel">
            <div className="selected-day-panel__header">
              <div>
                <p className="selected-day-panel__eyebrow">
                  Selected Date
                </p>
                <h3>{selectedDateLabel}</h3>
              </div>

              <span className="selected-day-panel__count">
                {selectedDateEvents.length}{" "}
                {selectedDateEvents.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            {selectedDateEvents.length > 0 ? (
              <div className="selected-day-panel__events">
                {selectedDateEvents.map((event) => (
                  <ScheduleEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="calendar-empty-state">
                <h3>No schedule entries</h3>
                <p>
                  There are no jobs or appointments scheduled for this date.
                </p>
              </div>
            )}
          </section>
        </section>

        <aside className="calendar-page__requests">
          <div className="calendar-page__requests-header">
            <div>
              <p className="calendar-page__requests-eyebrow">
                Pending Review
              </p>

              <h2>Schedule Requests</h2>
            </div>

            <span className="calendar-page__requests-count">
              {visibleRequests.length}
            </span>
          </div>

          <ScheduleRequestList requests={visibleRequests} />
        </aside>
      </div>
    </section>
  );
}

export default Calendar;
