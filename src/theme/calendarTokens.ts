import { VotingResourceId } from "../constants/votingResources";

export const COMPACT_RESOURCE_ID = "others" as const;

export type CalendarResourceId = VotingResourceId | typeof COMPACT_RESOURCE_ID;

export interface CalendarResourceTheme {
  border: string;
  fill: string;
  text: string;
  accent: string;
}

const BASE_PALETTE: Record<CalendarResourceId, CalendarResourceTheme> = {
  stats50: {
    border: "#A0A8B8",
    fill: "rgba(241, 243, 247, 0.5)",
    text: "#30353F",
    accent: "#E4E8F0",
  }, // gray
  stats70: {
    border: "#2577FF",
    fill: "rgba(227, 238, 255, 0.5)",
    text: "#0E2E73",
    accent: "#C8DBFF",
  }, // blue
  stats90: {
    border: "#1FAD6F",
    fill: "rgba(220, 246, 234, 0.5)",
    text: "#0A3C26",
    accent: "#C7F0DE",
  }, // green
  user: {
    border: "#F97316",
    fill: "rgba(255, 236, 221, 0.5)",
    text: "#6B2A00",
    accent: "#FFD7B8",
  }, // orange
  others: {
    border: "#7D89FF",
    fill: "rgba(236, 238, 255, 0.5)",
    text: "#1F2466",
    accent: "#E0E3FF",
  },
};

export const calendarBreakpoints = {
  compact: 640,
} as const;

export const COMPACT_MEDIA_QUERY = `(max-width: ${calendarBreakpoints.compact}px)`;

/**
 * Возвращает тему для конкретного ресурса и гарантирует, что компоненты
 * не будут разъезжаться по цветам.
 */
export const getResourceTheme = (
  resourceId: CalendarResourceId,
): CalendarResourceTheme => BASE_PALETTE[resourceId];
