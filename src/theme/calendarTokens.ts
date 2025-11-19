import { VotingResourceId } from '../constants/votingResources';

export const COMPACT_RESOURCE_ID = 'others' as const;

export type CalendarResourceId = VotingResourceId | typeof COMPACT_RESOURCE_ID;

export interface CalendarResourceTheme {
  border: string;
  fill: string;
  text: string;
  accent: string;
}

const BASE_PALETTE: Record<CalendarResourceId, CalendarResourceTheme> = {
  stats50: { border: '#A0A8B8', fill: '#F1F3F7', text: '#30353F', accent: '#E4E8F0' }, // gray
  stats70: { border: '#2577FF', fill: '#E3EEFF', text: '#0E2E73', accent: '#C8DBFF' }, // blue
  stats90: { border: '#1FAD6F', fill: '#DCF6EA', text: '#0A3C26', accent: '#C7F0DE' }, // green
  user: { border: '#F97316', fill: '#FFECDD', text: '#6B2A00', accent: '#FFD7B8' }, // orange
  others: { border: '#7D89FF', fill: '#ECEEFF', text: '#1F2466', accent: '#E0E3FF' },
};

export const calendarBreakpoints = {
  compact: 640,
} as const;

export const COMPACT_MEDIA_QUERY = `(max-width: ${calendarBreakpoints.compact}px)`;

/**
 * Возвращает тему для конкретного ресурса и гарантирует, что компоненты
 * не будут разъезжаться по цветам.
 */
export const getResourceTheme = (resourceId: CalendarResourceId): CalendarResourceTheme => BASE_PALETTE[resourceId];


