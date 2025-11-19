import React, { useCallback, useMemo } from 'react';
import { Calendar, SlotInfo } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { Modal } from 'antd';
import calendarLocalizer from '../utils/calendarLocalizer';
import { createEventId, ensureDuration, normalizeDate } from '../utils/calendarEventHelpers';

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

export const VOTING_RESOURCES = [
  { id: 'stats50', title: '50%' },
  { id: 'stats70', title: '70%' },
  { id: 'stats90', title: '90%' },
  { id: 'user', title: 'Мой выбор' },
] as const;

export type VotingResource = (typeof VOTING_RESOURCES)[number];
export type VotingResourceId = VotingResource['id'];

export const USER_RESOURCE_ID: VotingResourceId = 'user';
export const STATS_RESOURCE_IDS: VotingResourceId[] = ['stats50', 'stats70', 'stats90'];

export interface VotingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: VotingResourceId;
  isEditable?: boolean;
}

const DnDCalendar = withDragAndDrop<VotingEvent>(Calendar as React.ComponentType<any>);

const colorPalette: Record<VotingResourceId, string> = {
  stats50: '#FFF5E1',
  stats70: '#FFE8F1',
  stats90: '#E6F4FF',
  user: '#D4F5DD',
};

interface VotingCalendarProps {
  date: Date;
  statsEvents: VotingEvent[];
  userEvents: VotingEvent[];
  onUserEventsChange: (next: VotingEvent[]) => void;
  onDateChange: (next: Date) => void;
}

const VotingCalendar: React.FC<VotingCalendarProps> = ({ date, statsEvents, userEvents, onUserEventsChange, onDateChange }) => {
  const events = useMemo(() => [...statsEvents, ...userEvents], [statsEvents, userEvents]);

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

  const eventPropGetter = useCallback(
    (event: VotingEvent) => ({
      style: {
        backgroundColor: colorPalette[event.resourceId],
        color: '#1F1F1F',
        opacity: event.resourceId === USER_RESOURCE_ID ? 1 : 0.8,
        cursor: event.resourceId === USER_RESOURCE_ID ? 'move' : 'default',
      },
    }),
    []
  );

  return (
    <DnDCalendar
      culture="ru"
      date={date}
      events={events}
      localizer={calendarLocalizer}
      messages={calendarMessages}
      defaultView="day"
      views={{ day: true }}
      toolbar
      selectable
      resizable
      step={30}
      timeslots={2}
      scrollToTime={scrollToTime}
      resources={VOTING_RESOURCES}
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
      style={{ height: 520 }}
    />
  );
};

export default VotingCalendar;


