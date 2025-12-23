import React, { useCallback, useMemo } from "react";
import { Calendar } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { Modal, Spin } from "antd";
import calendarLocalizer from "../utils/calendarLocalizer";
import {
  createEventId,
  ensureDuration,
  normalizeDate,
} from "../utils/calendarEventHelpers";
import { hasOverlap, showValidationWarning } from "../utils/intervalGuards";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

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

  const handleSelectEvent = useCallback(
    (event: ConstraintEvent) => {
      Modal.confirm({
        title: "Удалить слот?",
        content: "Слот исчезнет из списка ограничений.",
        okText: "Удалить",
        cancelText: "Отмена",
        onOk: () =>
          onEventsChange(events.filter((item) => item.id !== event.id)),
      });
    },
    [events, onEventsChange],
  );

  return (
    <div style={{ position: "relative", height: 520 }}>
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
        style={{ height: "100%" }}
      />
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            background: "rgba(255, 255, 255, 0.4)",
            zIndex: 100,
            borderRadius: "10px",
          }}
        >
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default ConstraintsCalendar;
