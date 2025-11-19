import React, { useState } from 'react';
import VotingCalendar from '../components/VotingCalendar';
import type { VotingEvent } from '../types/calendar';
import { USER_RESOURCE_ID } from '../constants/votingResources';

const baseDate = new Date('2024-05-10T09:00:00');

const sampleStats: VotingEvent[] = [
  { id: 's50-1', title: '3-4 чел.', start: new Date('2024-05-10T09:00:00'), end: new Date('2024-05-10T09:30:00'), resourceId: 'stats50' },
  { id: 's70-1', title: '5-6 чел.', start: new Date('2024-05-10T10:00:00'), end: new Date('2024-05-10T10:30:00'), resourceId: 'stats70' },
  { id: 's90-1', title: '8-9 чел.', start: new Date('2024-05-10T11:00:00'), end: new Date('2024-05-10T11:30:00'), resourceId: 'stats90' },
];

const storyFactory = (style?: React.CSSProperties) => () => {
  const [date, setDate] = useState(baseDate);
  const [userEvents, setUserEvents] = useState<VotingEvent[]>([
    {
      id: 'user-1',
      title: 'Я могу',
      start: new Date('2024-05-10T09:30:00'),
      end: new Date('2024-05-10T10:30:00'),
      resourceId: USER_RESOURCE_ID,
      isEditable: true,
    },
  ]);

  return (
    <div style={{ padding: 16, background: '#f5f6fb', ...style }}>
      <VotingCalendar
        date={date}
        statsEvents={sampleStats}
        userEvents={userEvents}
        onUserEventsChange={setUserEvents}
        onDateChange={setDate}
      />
    </div>
  );
};

export default {
  title: 'Calendar/VotingCalendar',
  component: VotingCalendar,
};

export const Desktop = storyFactory({ width: 900 });
export const Mobile = storyFactory({ width: 360 });


