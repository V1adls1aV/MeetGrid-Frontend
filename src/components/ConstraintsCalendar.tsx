// Purpose: интерактивный календарь ограничений с поддержкой drag&drop.
import React, { useCallback, useMemo } from 'react';
import { Calendar } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { Modal } from 'antd';
import calendarLocalizer from '../utils/calendarLocalizer';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

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
}

interface DragEventArgs {
  event: ConstraintEvent;
  start: Date;
  end: Date;
}

interface SlotPayload {
  action: 'select' | 'click' | 'doubleClick';
  start: Date | string;
  end: Date | string;
}

const SLOT_MINUTES = 15;
const DEFAULT_TITLE = 'Окно';
const DnDCalendar = withDragAndDrop<ConstraintEvent>(Calendar as React.ComponentType<any>);

const calendarMessages = {
  today: 'Сегодня',
  previous: 'Назад',
  next: 'Вперёд',
  day: 'День',
  noEventsInRange: 'Нет доступных слотов',
  showMore: (total: number) => `+ ещё ${total}`,
};

/**
 * Generates deterministic ids so drag handlers can keep reference to events.
 */
const createEventId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * Guarantees that a new slot always spans at least SLOT_MINUTES.
 */
const ensureDuration = (start: Date, end: Date) => {
  if (end <= start) {
    return new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);
  }
  return end;
};

/**
 * Normalizes any Date-like input to an actual Date instance.
 */
const normalizeDate = (value: Date | string) => (value instanceof Date ? value : new Date(value));

const ConstraintsCalendar: React.FC<ConstraintsCalendarProps> = ({ date, events, onEventsChange }) => {
  const scrollToTime = useMemo(() => {
    const anchor = new Date(date);
    anchor.setHours(8, 0, 0, 0);
    return anchor;
  }, [date]);

  const updateEvent = useCallback(
    (id: string, nextFields: Partial<ConstraintEvent>) => {
      onEventsChange(events.map((event) => (event.id === id ? { ...event, ...nextFields } : event)));
    },
    [events, onEventsChange]
  );

  const handleSelectSlot = useCallback(
    (slot: SlotPayload) => {
      if (slot.action !== 'select') {
        return;
      }

      const start = normalizeDate(slot.start);
      const end = ensureDuration(start, normalizeDate(slot.end));

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
    [events, onEventsChange]
  );

  const handleEventDrop = useCallback(
    ({ event, start, end }: DragEventArgs) => {
      updateEvent(event.id, { start, end });
    },
    [updateEvent]
  );

  const handleEventResize = useCallback(
    ({ event, start, end }: DragEventArgs) => {
      updateEvent(event.id, { start, end });
    },
    [updateEvent]
  );

  const handleSelectEvent = useCallback(
    (event: ConstraintEvent) => {
      Modal.confirm({
        title: 'Удалить слот?',
        content: 'Слот исчезнет из списка ограничений.',
        okText: 'Удалить',
        cancelText: 'Отмена',
        onOk: () => onEventsChange(events.filter((item) => item.id !== event.id)),
      });
    },
    [events, onEventsChange]
  );

  return (
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
      step={30}
      timeslots={2}
      scrollToTime={scrollToTime}
      onSelectSlot={handleSelectSlot}
      onEventDrop={handleEventDrop}
      onEventResize={handleEventResize}
      onSelectEvent={handleSelectEvent}
      draggableAccessor={() => true}
      resizableAccessor={() => true}
      style={{ height: 520 }}
    />
  );
};

export default ConstraintsCalendar;


