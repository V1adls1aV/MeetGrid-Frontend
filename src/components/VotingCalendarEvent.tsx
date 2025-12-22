import React, { useMemo } from 'react';
import type { EventProps } from 'react-big-calendar';
import { USER_RESOURCE_ID } from '../constants/votingResources';
import type { CalendarRenderEvent } from '../utils/calendarLayout';
import styles from './VotingCalendar.module.css';

const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

const formatRange = (start: Date, end: Date) => `${timeFormatter.format(start)} — ${timeFormatter.format(end)}`;

const VotingCalendarEvent: React.FC<EventProps<CalendarRenderEvent>> = ({ event }) => {
  const timeRange = useMemo(() => formatRange(event.start, event.end), [event.end, event.start]);

  return (
    <div className={styles.eventContent}>
      <span className={styles.eventTime}>{timeRange}</span>
      <span className={styles.eventTitle}>{event.title}</span>
    </div>
  );
};

export default VotingCalendarEvent;


