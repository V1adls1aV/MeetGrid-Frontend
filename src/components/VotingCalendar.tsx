import React, { useCallback, useMemo } from "react";
import { Calendar, SlotInfo } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { Modal } from "antd";
import useMediaQuery from "../hooks/useMediaQuery";
import { COMPACT_MEDIA_QUERY, getResourceTheme } from "../theme/calendarTokens";
import {
  buildResourceList,
  CalendarRenderEvent,
  mapEventsToLayout,
} from "../utils/calendarLayout";
import calendarLocalizer from "../utils/calendarLocalizer";
import {
  createEventId,
  ensureDuration,
  normalizeDate,
} from "../utils/calendarEventHelpers";
import {
  hasOverlap,
  fitsConstraints,
  showValidationWarning,
} from "../utils/intervalGuards";
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
}

const VotingCalendar: React.FC<VotingCalendarProps> = ({
  date,
  statsEvents,
  userEvents,
  onUserEventsChange,
  onDateChange,
  constraints = [],
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

  const userTimedEvents = useMemo(
    () => userEvents.map(({ id, start, end }) => ({ id, start, end })),
    [userEvents],
  );

  const scrollToTime = useMemo(() => {
    const anchor = new Date(date);
    anchor.setHours(8, 0, 0, 0);
    return anchor;
  }, [date]);

  const updateUserEvent = useCallback(
    (id: string, patch: Partial<VotingEvent>) => {
      onUserEventsChange(
        userEvents.map((event) =>
          event.id === id ? { ...event, ...patch } : event,
        ),
      );
    },
    [onUserEventsChange, userEvents],
  );

  const handleSelectSlot = useCallback(
    (slot: SlotInfo) => {
      if (slot.action !== "select" || slot.resourceId !== USER_RESOURCE_ID) {
        return;
      }

      const start = normalizeDate(slot.start as Date | string);
      const end = ensureDuration(
        start,
        normalizeDate(slot.end as Date | string),
      );
      const candidate = { start, end };

      if (hasOverlap(userTimedEvents, candidate)) {
        showValidationWarning(
          "Можно выбрать только непересекающиеся интервалы.",
        );
        return;
      }

      if (!fitsConstraints(candidate, constraints)) {
        showValidationWarning(
          "Интервал должен полностью лежать в доступных окнах.",
        );
        return;
      }

      const id = createEventId();

      onUserEventsChange([
        ...userEvents,
        {
          id,
          title: "Доступен",
          start,
          end,
          resourceId: USER_RESOURCE_ID,
          isEditable: true,
        },
      ]);
    },
    [constraints, onUserEventsChange, userEvents, userTimedEvents],
  );

  const handleEventDrop = useCallback(
    ({ event, start, end }: any) => {
      if (event.resourceId !== USER_RESOURCE_ID) {
        return;
      }

      const candidate = { id: event.id, start, end };

      if (hasOverlap(userTimedEvents, candidate)) {
        showValidationWarning(
          "Можно выбрать только непересекающиеся интервалы.",
        );
        return;
      }

      if (!fitsConstraints(candidate, constraints)) {
        showValidationWarning(
          "Интервал должен полностью лежать в доступных окнах.",
        );
        return;
      }

      updateUserEvent(event.id, { start, end });
    },
    [constraints, updateUserEvent, userTimedEvents],
  );

  const handleEventResize = useCallback(
    ({ event, start, end }: any) => {
      if (event.resourceId !== USER_RESOURCE_ID) {
        return;
      }

      const candidate = { id: event.id, start, end };

      if (hasOverlap(userTimedEvents, candidate)) {
        showValidationWarning(
          "Можно выбрать только непересекающиеся интервалы.",
        );
        return;
      }

      if (!fitsConstraints(candidate, constraints)) {
        showValidationWarning(
          "Интервал должен полностью лежать в доступных окнах.",
        );
        return;
      }

      updateUserEvent(event.id, { start, end });
    },
    [constraints, updateUserEvent, userTimedEvents],
  );

  const handleSelectEvent = useCallback(
    (event: any) => {
      if (event.isBackground) return;

      if (event.resourceId !== USER_RESOURCE_ID) {
        return;
      }

      Modal.confirm({
        title: "Удалить слот?",
        content: "Он исчезнет из вашего голосования.",
        okText: "Удалить",
        cancelText: "Отмена",
        onOk: () =>
          onUserEventsChange(userEvents.filter((item) => item.id !== event.id)),
      });
    },
    [onUserEventsChange, userEvents],
  );

  const eventPropGetter = useCallback((event: any) => {
    if (event.isBackground) {
      const position = event.visualPosition as VisualPosition;
      const radius = 10;

      // Ensure that event start/end match day boundaries to avoid rounding at the very top/bottom
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

      const topLeft =
        !isTouchingTop && (position === "start" || position === "single")
          ? radius
          : 0;
      const bottomLeft =
        !isTouchingBottom && (position === "start" || position === "single")
          ? radius
          : 0;
      const topRight = position === "end" || position === "single" ? radius : 0;
      const bottomRight =
        position === "end" || position === "single" ? radius : 0;

      if (topLeft) style.borderTopLeftRadius = topLeft;
      if (bottomLeft) style.borderBottomLeftRadius = bottomLeft;
      if (topRight) style.borderTopRightRadius = topRight;
      if (bottomRight) style.borderBottomRightRadius = bottomRight;

      return {
        style,
        className: styles.backgroundEvent,
      };
    }

    const theme = getResourceTheme(event.resourceId);
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
    <div className={shellClassName}>
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
        draggableAccessor={(event) => Boolean(event.isEditable)}
        resizableAccessor={(event) => Boolean(event.isEditable)}
        eventPropGetter={eventPropGetter}
        components={calendarComponents}
        style={{ height: "100%" }}
      />
    </div>
  );
};

export default VotingCalendar;
