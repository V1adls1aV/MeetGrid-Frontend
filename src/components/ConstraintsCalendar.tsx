import React, { useCallback, useMemo, useState } from "react";
import { Calendar } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { Spin } from "antd";
import calendarLocalizer from "../utils/calendarLocalizer";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import {
  createEventId,
  ensureDuration,
  normalizeDate,
} from "../utils/calendarEventHelpers";
import {
  hasOverlap,
  isWithinDayLimit,
  isLongEnough,
  showValidationWarning,
} from "../utils/intervalGuards";
import { USER_RESOURCE_ID } from "../constants/votingResources";
import { getResourceTheme } from "../theme/calendarTokens";
import VotingCalendarEvent from "./VotingCalendarEvent";
import EventEditModal from "./EventEditModal";
import type { VotingEvent } from "../types/calendar";

import baseStyles from "./CalendarBase.module.css";
import gridStyles from "./CalendarGrid.module.css";
import cardStyles from "./CalendarCards.module.css";
import layoutStyles from "./CalendarLayout.module.css";

export interface ConstraintEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface ConstraintsCalendarProps {
  date: Date;
  events: ConstraintEvent[];
  onEventsChange: (next: ConstraintEvent[]) => void;
  loading?: boolean;
}

interface DragEventArgs {
  event: ConstraintEvent;
  start: Date;
  end: Date;
}

interface SlotPayload {
  action: "select" | "click" | "doubleClick";
  start: Date | string;
  end: Date | string;
}

const DEFAULT_TITLE = "Окно";
const DnDCalendar = withDragAndDrop<ConstraintEvent>(
  Calendar as React.ComponentType<any>,
);

const calendarMessages = {
  today: "Сегодня",
  previous: "Назад",
  next: "Вперёд",
  day: "День",
  noEventsInRange: "Нет доступных слотов",
  showMore: (total: number) => `+ ещё ${total}`,
};

const ConstraintsCalendar: React.FC<ConstraintsCalendarProps> = ({
  date,
  events,
  onEventsChange,
  loading = false,
}) => {
  const [editingEvent, setEditingEvent] = useState<ConstraintEvent | null>(
    null,
  );

  const scrollToTime = useMemo(() => {
    const anchor = new Date(date);
    anchor.setHours(8, 0, 0, 0);
    return anchor;
  }, [date]);

  const updateEvent = useCallback(
    (id: string, nextFields: Partial<ConstraintEvent>) => {
      onEventsChange(
        events.map((event) =>
          event.id === id ? { ...event, ...nextFields } : event,
        ),
      );
    },
    [events, onEventsChange],
  );

  const handleSelectSlot = useCallback(
    (slot: SlotPayload) => {
      if (slot.action !== "select") {
        return;
      }

      const start = normalizeDate(slot.start);
      const end = ensureDuration(start, normalizeDate(slot.end));
      const candidate = { start, end };

      if (!isWithinDayLimit(candidate)) {
        showValidationWarning("Слот не может заканчиваться позже 23:45.");
        return;
      }

      if (!isLongEnough(candidate)) {
        showValidationWarning("Минимальная длительность слота — 30 минут.");
        return;
      }

      if (hasOverlap(events, candidate)) {
        showValidationWarning(
          "Можно выбрать только непересекающиеся интервалы.",
        );
        return;
      }

      onEventsChange([
        ...events,
        {
          id: createEventId(),
          title: DEFAULT_TITLE,
          start,
          end,
        },
      ]);
    },
    [events, onEventsChange],
  );

  const handleEventDrop = useCallback(
    ({ event, start, end }: any) => {
      const candidate = { id: event.id, start, end };

      if (!isWithinDayLimit(candidate)) {
        showValidationWarning("Слот не может заканчиваться позже 23:45.");
        return;
      }

      if (!isLongEnough(candidate)) {
        showValidationWarning("Минимальная длительность слота — 30 минут.");
        return;
      }

      if (hasOverlap(events, candidate)) {
        showValidationWarning(
          "Можно выбрать только непересекающиеся интервалы.",
        );
        return;
      }

      updateEvent(event.id, { start, end });
    },
    [events, updateEvent],
  );

  const handleEventResize = useCallback(
    ({ event, start, end }: any) => {
      const candidate = { id: event.id, start, end };

      if (!isWithinDayLimit(candidate)) {
        showValidationWarning("Слот не может заканчиваться позже 23:45.");
        return;
      }

      if (!isLongEnough(candidate)) {
        showValidationWarning("Минимальная длительность слота — 30 минут.");
        return;
      }

      if (hasOverlap(events, candidate)) {
        showValidationWarning(
          "Можно выбрать только непересекающиеся интервалы.",
        );
        return;
      }

      updateEvent(event.id, { start, end });
    },
    [events, updateEvent],
  );

  const handleSelectEvent = useCallback((event: ConstraintEvent) => {
    setEditingEvent(event);
  }, []);

  const handleSaveEvent = (id: string, start: Date, end: Date) => {
    const candidate = { id, start, end };
    const otherEvents = events.filter((e) => e.id !== id);

    if (!isWithinDayLimit(candidate)) {
      showValidationWarning("Слот не может заканчиваться позже 23:45.");
      return;
    }

    if (!isLongEnough(candidate)) {
      showValidationWarning("Минимальная длительность слота — 30 минут.");
      return;
    }

    if (hasOverlap(otherEvents, candidate)) {
      showValidationWarning("Интервал пересекается с существующими окнами.");
      return;
    }

    onEventsChange(events.map((e) => (e.id === id ? { ...e, start, end } : e)));
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    onEventsChange(events.filter((e) => e.id !== id));
    setEditingEvent(null);
  };

  const eventPropGetter = useCallback(() => {
    const theme = getResourceTheme(USER_RESOURCE_ID);
    return {
      style: {
        "--calendar-card-border": theme.border,
        "--calendar-card-fill": theme.fill,
        "--calendar-card-text": theme.text,
        cursor: "move",
      } as React.CSSProperties,
      className: [cardStyles.foregroundEvent, cardStyles.userCard].join(" "),
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
    layoutStyles.desktop,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName} style={{ position: "relative" }}>
      <DnDCalendar
        culture="ru"
        date={date}
        defaultDate={date}
        events={events}
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
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onSelectEvent={handleSelectEvent}
        draggableAccessor={() => true}
        resizableAccessor={() => true}
        eventPropGetter={eventPropGetter}
        components={calendarComponents as any}
        style={{ height: "100%" }}
      />
      {loading && (
        <div className={layoutStyles.calendarLoadingOverlay}>
          <Spin size="large" />
        </div>
      )}
      <EventEditModal
        visible={!!editingEvent}
        event={editingEvent as unknown as VotingEvent}
        onCancel={() => setEditingEvent(null)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default ConstraintsCalendar;
