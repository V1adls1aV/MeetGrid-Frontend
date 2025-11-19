import React, { useCallback, useMemo } from 'react';
import { Calendar, SlotInfo } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { Modal } from 'antd';
import useMediaQuery from '../hooks/useMediaQuery';
import { COMPACT_MEDIA_QUERY, getResourceTheme } from '../theme/calendarTokens';
import { buildResourceList, CalendarRenderEvent, mapEventsToLayout } from '../utils/calendarLayout';
import calendarLocalizer from '../utils/calendarLocalizer';
import { createEventId, ensureDuration, normalizeDate } from '../utils/calendarEventHelpers';
import { USER_RESOURCE_ID } from '../constants/votingResources';
import type { VotingEvent } from '../types/calendar';
import VotingCalendarEvent from './VotingCalendarEvent';
import styles from './VotingCalendar.module.css';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const calendarMessages = {
  today: 'Сегодня',
  previous: 'Назад',
  next: 'Вперёд',
  day: 'День',
  noEventsInRange: 'Нет слотов',
  showMore: (total: number) => `+ ещё ${total}`,
};

const DnDCalendar = withDragAndDrop<CalendarRenderEvent>(Calendar as React.ComponentType<any>);

interface VotingCalendarProps {
  date: Date;
  statsEvents: VotingEvent[];
  userEvents: VotingEvent[];
  onUserEventsChange: (next: VotingEvent[]) => void;
  onDateChange: (next: Date) => void;
}

const VotingCalendar: React.FC<VotingCalendarProps> = ({ date, statsEvents, userEvents, onUserEventsChange, onDateChange }) => {
  const events = useMemo(() => [...statsEvents, ...userEvents], [statsEvents, userEvents]);
  const isCompact = useMediaQuery(COMPACT_MEDIA_QUERY);
  const layoutResources = useMemo(() => buildResourceList(isCompact), [isCompact]);
  const renderEvents = useMemo(
    () => mapEventsToLayout(events, isCompact),
    [events, isCompact]
  );

  const scrollToTime = useMemo(() => {
    const anchor = new Date(date);
    anchor.setHours(8, 0, 0, 0);
    return anchor;
  }, [date]);

  const updateUserEvent = useCallback(
    (id: string, patch: Partial<VotingEvent>) => {
      onUserEventsChange(userEvents.map((event) => (event.id === id ? { ...event, ...patch } : event)));
    },
    [onUserEventsChange, userEvents]
  );

  const handleSelectSlot = useCallback(
    (slot: SlotInfo) => {
      if (slot.action !== 'select' || slot.resourceId !== USER_RESOURCE_ID) {
        return;
      }

      const start = normalizeDate(slot.start as Date | string);
      const end = ensureDuration(start, normalizeDate(slot.end as Date | string));

      onUserEventsChange([
        ...userEvents,
        {
          id: createEventId(),
          title: 'Доступен',
          start,
          end,
          resourceId: USER_RESOURCE_ID,
          isEditable: true,
        },
      ]);
    },
    [onUserEventsChange, userEvents]
  );

  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: VotingEvent; start: Date; end: Date }) => {
      if (event.resourceId !== USER_RESOURCE_ID) {
        return;
      }

      updateUserEvent(event.id, { start, end });
    },
    [updateUserEvent]
  );

  const handleEventResize = useCallback(
    ({ event, start, end }: { event: VotingEvent; start: Date; end: Date }) => {
      if (event.resourceId !== USER_RESOURCE_ID) {
        return;
      }

      updateUserEvent(event.id, { start, end });
    },
    [updateUserEvent]
  );

  const handleSelectEvent = useCallback(
    (event: VotingEvent) => {
      if (event.resourceId !== USER_RESOURCE_ID) {
        return;
      }

      Modal.confirm({
        title: 'Удалить слот?',
        content: 'Он исчезнет из вашего голосования.',
        okText: 'Удалить',
        cancelText: 'Отмена',
        onOk: () => onUserEventsChange(userEvents.filter((item) => item.id !== event.id)),
      });
    },
    [onUserEventsChange, userEvents]
  );

  const eventPropGetter = useCallback((event: CalendarRenderEvent) => {
    const theme = getResourceTheme(event.resourceId);
    return {
      style: {
        '--calendar-card-border': theme.border,
        '--calendar-card-fill': theme.fill,
        '--calendar-card-text': theme.text,
        cursor: event.resourceId === USER_RESOURCE_ID ? 'move' : 'default',
      } as React.CSSProperties,
    };
  }, []);

  const calendarComponents = useMemo(() => ({ event: VotingCalendarEvent }), []);

  const shellClassName = [
    styles.calendarShell,
    isCompact ? styles.compact : styles.desktop,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClassName}>
      <DnDCalendar
        culture="ru"
        date={date}
        events={renderEvents}
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
        resources={layoutResources}
        resourceIdAccessor="id"
        resourceTitleAccessor="title"
        onNavigate={onDateChange}
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        onSelectEvent={handleSelectEvent}
        draggableAccessor={(event) => Boolean(event.isEditable)}
        resizableAccessor={(event) => Boolean(event.isEditable)}
        eventPropGetter={eventPropGetter}
        components={calendarComponents}
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default VotingCalendar;


