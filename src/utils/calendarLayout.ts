import { VOTING_RESOURCES, USER_RESOURCE_ID, VotingResourceId } from '../constants/votingResources';
import { CalendarResourceId, COMPACT_RESOURCE_ID } from '../theme/calendarTokens';
import { VotingEvent } from '../types/calendar';

export interface CalendarResourceDescriptor {
  id: CalendarResourceId;
  title: string;
}

export type CalendarRenderEvent = Omit<VotingEvent, 'resourceId'> & { resourceId: CalendarResourceId };

const COMPACT_RESOURCES: CalendarResourceDescriptor[] = [
  { id: COMPACT_RESOURCE_ID, title: 'Группа' },
  { id: USER_RESOURCE_ID, title: 'Я' },
];

const DESKTOP_RESOURCES: CalendarResourceDescriptor[] = [...VOTING_RESOURCES];

const mapResourceId = (resourceId: VotingResourceId, isCompact: boolean): CalendarResourceId =>
  isCompact && resourceId !== USER_RESOURCE_ID ? COMPACT_RESOURCE_ID : resourceId;

/**
 * Возвращает набор ресурсов для конкретного layout (полный или мобильный).
 */
export const buildResourceList = (isCompact: boolean): CalendarResourceDescriptor[] =>
  (isCompact ? COMPACT_RESOURCES : DESKTOP_RESOURCES);

/**
 * Приводит события к целевому layout, чтобы React Big Calendar получил корректные resourceId.
 */
export const mapEventsToLayout = (events: VotingEvent[], isCompact: boolean): CalendarRenderEvent[] =>
  events.map((event) => ({
    ...event,
    resourceId: mapResourceId(event.resourceId, isCompact),
  }));


