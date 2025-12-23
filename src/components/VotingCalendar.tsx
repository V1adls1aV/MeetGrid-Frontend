import React, { useCallback, useMemo, useState } from "react";
import { Calendar } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { Spin } from "antd";
import useMediaQuery from "../hooks/useMediaQuery";
import { useCalendarHandlers } from "../hooks/useCalendarHandlers";
import {
  COMPACT_MEDIA_QUERY,
  getResourceTheme,
  CalendarResourceId,
} from "../theme/calendarTokens";
import {
  buildResourceList,
  CalendarRenderEvent,
  mapEventsToLayout,
} from "../utils/calendarLayout";
import calendarLocalizer from "../utils/calendarLocalizer";
import {
  getBlockedIntervals,
  generateBackgroundEvents,
  VisualPosition,
} from "../utils/calendarBackgroundEvents";
import {
  USER_RESOURCE_ID,
  setDayStart,
  setDayEnd,
} from "../constants/votingResources";
import type { VotingEvent } from "../types/calendar";
import type { Interval } from "../types/topic";
import VotingCalendarEvent from "./VotingCalendarEvent";
import EventEditModal from "./EventEditModal";
import {
  hasOverlap,
  fitsConstraints,
  showValidationWarning,
} from "../utils/intervalGuards";
import styles from "./VotingCalendar.module.css";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const calendarMessages = {
  today: "Сегодня",
  previous: "Назад",
  next: "Вперёд",
  day: "День",
  noEventsInRange: "Нет слотов",
  showMore: (total: number) => `+ ещё ${total}`,
};

const DnDCalendar = withDragAndDrop<CalendarRenderEvent>(
  Calendar as React.ComponentType<any>,
);

interface VotingCalendarProps {
  date: Date;
  statsEvents: VotingEvent[];
  userEvents: VotingEvent[];
  onUserEventsChange: (next: VotingEvent[]) => void;
  onDateChange: (next: Date) => void;
  constraints?: Interval[];
  loading?: boolean;
}

const VotingCalendar: React.FC<VotingCalendarProps> = ({
  date,
  statsEvents,
  userEvents,
  onUserEventsChange,
  onDateChange,
  constraints = [],
  loading = false,
}) => {
  const events = useMemo(
    () => [...statsEvents, ...userEvents],
    [statsEvents, userEvents],
  );
  const isCompact = useMediaQuery(COMPACT_MEDIA_QUERY);
  const layoutResources = useMemo(
    () => buildResourceList(isCompact),
    [isCompact],
  );
  const renderEvents = useMemo(
    () => mapEventsToLayout(events, isCompact),
    [events, isCompact],
  );

  const backgroundEvents = useMemo(() => {
    const blocked = getBlockedIntervals(date, constraints);
    const resourceIds = layoutResources.map((r) => r.id);
    return generateBackgroundEvents(
      blocked,
      resourceIds,
    ) as unknown as CalendarRenderEvent[];
  }, [date, constraints, layoutResources]);

  const [editingEvent, setEditingEvent] = useState<VotingEvent | null>(null);

  const {
    handleSelectSlot,
    handleEventDrop,
    handleEventResize,
    handleSelectEvent,
  } = useCalendarHandlers({
    userEvents,
    onUserEventsChange,
    constraints,
    onEditEvent: setEditingEvent,
  });

  const handleSaveEvent = (id: string, start: Date, end: Date) => {
    const candidate = { id, start, end };
    const otherEvents = userEvents.filter((e) => e.id !== id);

    if (hasOverlap(otherEvents, candidate)) {
      showValidationWarning("Интервал пересекается с существующими слотами.");
      return;
    }

    if (!fitsConstraints(candidate, constraints)) {
      showValidationWarning("Интервал должен лежать внутри доступных окон.");
      return;
    }

    onUserEventsChange(
      userEvents.map((e) => (e.id === id ? { ...e, start, end } : e)),
    );
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    onUserEventsChange(userEvents.filter((e) => e.id !== id));
    setEditingEvent(null);
  };

  const scrollToTime = useMemo(() => {
    const anchor = new Date(date);
    anchor.setHours(8, 0, 0, 0);
    return anchor;
  }, [date]);

  const eventPropGetter = useCallback((event: any) => {
    if (event.isBackground) {
      const position = event.visualPosition as VisualPosition;
      const radius = 10;

      const dayStart = setDayStart(event.start);
      const dayEnd = setDayEnd(event.end);
      const isTouchingTop = event.start.getTime() <= dayStart.getTime();
      const isTouchingBottom = event.end.getTime() >= dayEnd.getTime();

      const style: React.CSSProperties = {
        backgroundColor: "rgba(120, 120, 120, 0.4)",
        border: "none",
        borderRadius: 0,
        pointerEvents: "none",
      };

      const hasLeftRound = position === "start" || position === "single";
      const hasRightRound = position === "end" || position === "single";

      if (!isTouchingTop && hasLeftRound) style.borderTopLeftRadius = radius;
      if (!isTouchingBottom && hasLeftRound)
        style.borderBottomLeftRadius = radius;
      if (hasRightRound) {
        style.borderTopRightRadius = radius;
        style.borderBottomRightRadius = radius;
      }

      return { style, className: styles.backgroundEvent };
    }

    const theme = getResourceTheme(event.resourceId as CalendarResourceId);
    const isUserEvent = event.resourceId === USER_RESOURCE_ID;

    return {
      style: {
        "--calendar-card-border": theme.border,
        "--calendar-card-fill": theme.fill,
        "--calendar-card-text": theme.text,
        cursor: isUserEvent ? "move" : "default",
      } as React.CSSProperties,
      className: [
        styles.foregroundEvent,
        isUserEvent ? styles.userCard : styles.statsCard,
      ].join(" "),
    };
  }, []);

  const calendarComponents = useMemo(
    () => ({ event: VotingCalendarEvent }),
    [],
  );

  const shellClassName = [
    styles.calendarShell,
    isCompact ? styles.compact : styles.desktop,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName} style={{ position: "relative" }}>
      <DnDCalendar
        culture="ru"
        date={date}
        events={renderEvents}
        backgroundEvents={backgroundEvents}
        localizer={calendarLocalizer}
        messages={calendarMessages}
        defaultView="day"
        views={{ day: true }}
        toolbar={false}
        selectable
        resizable
        step={15}
        timeslots={4}
        scrollToTime={scrollToTime}
        resources={layoutResources}
        resourceIdAccessor={(resource: any) => resource.id}
        resourceTitleAccessor={(resource: any) => resource.title}
        onNavigate={onDateChange}
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onSelectEvent={handleSelectEvent}
        draggableAccessor={(event) =>
          Boolean(event.isEditable) && (!isCompact || false)
        }
        resizableAccessor={(event) =>
          Boolean(event.isEditable) && (!isCompact || false)
        }
        eventPropGetter={eventPropGetter}
        components={calendarComponents}
        style={{ height: "100%" }}
      />
      {loading && (
        <div className={styles.calendarLoadingOverlay}>
          <Spin size="large" />
        </div>
      )}
      <EventEditModal
        visible={!!editingEvent}
        event={editingEvent}
        onCancel={() => setEditingEvent(null)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default VotingCalendar;
