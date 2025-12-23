import React, { useCallback, useMemo, useState } from "react";
import { Calendar } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { Spin } from "antd";
import { useCalendarHandlers } from "../hooks/useCalendarHandlers";
import useMediaQuery from "../hooks/useMediaQuery";
import {
  getResourceTheme,
  CalendarResourceId,
  COMPACT_MEDIA_QUERY,
} from "../theme/calendarTokens";
import {
  buildResourceList,
  CalendarRenderEvent,
  mapEventsToLayout,
} from "../utils/calendarLayout";
import {
  calendarLocalizer,
  calendarMessages,
} from "../utils/calendarLocalizer";
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
  isWithinDayLimit,
  isLongEnough,
  showValidationWarning,
} from "../utils/intervalGuards";
import baseStyles from "./CalendarBase.module.css";
import gridStyles from "./CalendarGrid.module.css";
import cardStyles from "./CalendarCards.module.css";
import layoutStyles from "./CalendarLayout.module.css";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

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
  const isCompact = useMediaQuery(COMPACT_MEDIA_QUERY);

  const events = useMemo(
    () => [...statsEvents, ...userEvents],
    [statsEvents, userEvents],
  );

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

    if (!isWithinDayLimit(candidate)) {
      showValidationWarning("Слот не может заканчиваться позже 23:45.");
      return;
    }

    if (!isLongEnough(candidate)) {
      showValidationWarning("Минимальная длительность слота — 30 минут.");
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
        backgroundColor: "rgba(120, 120, 120, 0.3)",
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

      return { style, className: cardStyles.backgroundEvent };
    }

    const theme = getResourceTheme(event.resourceId as CalendarResourceId);
    const isUserEvent = event.resourceId === USER_RESOURCE_ID;

    // Добавляем класс, специфичный для ресурса, чтобы управлять наложением в CSS
    const resourceClass = `resource-${event.resourceId}`;

    return {
      style: {
        "--calendar-card-border": theme.border,
        "--calendar-card-fill": theme.fill,
        "--calendar-card-text": theme.text,
        cursor: isUserEvent ? "move" : "default",
      } as React.CSSProperties,
      className: [
        cardStyles.foregroundEvent,
        isUserEvent ? cardStyles.userCard : cardStyles.statsCard,
        resourceClass, // Global class for layout overrides
      ].join(" "),
    };
  }, []);

  const calendarComponents = useMemo(
    () => ({ event: VotingCalendarEvent }),
    [],
  );

  const shellClassName = [
    baseStyles.calendarShell,
    gridStyles.calendarShell,
    cardStyles.calendarShell,
    isCompact ? layoutStyles.compact : layoutStyles.desktop,
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
        <div className={layoutStyles.calendarLoadingOverlay}>
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
