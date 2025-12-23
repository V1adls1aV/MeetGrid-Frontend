import dayjs from "dayjs";
import { Interval } from "../types/topic";

const SLOT_MINUTES = 15;

export const createEventId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const ensureDuration = (
  start: Date,
  end: Date,
  minMinutes = SLOT_MINUTES,
) => {
  if (end <= start) {
    return new Date(start.getTime() + minMinutes * 60 * 1000);
  }
  return end;
};

export const normalizeDate = (value: Date | string) =>
  value instanceof Date ? value : new Date(value);

/**
 * Returns a Set of local dates (YYYY-MM-DD) that have assigned intervals.
 * "Today" is always included in the returned set.
 */
export const getAvailableDates = (intervals: Interval[]): Set<string> => {
  const dates = new Set<string>();
  // Always allow today
  dates.add(dayjs().format("YYYY-MM-DD"));

  intervals.forEach((inv) => {
    let current = dayjs(inv.start);
    const endDate = dayjs(inv.end);

    // Add days that the interval covers
    while (
      current.isBefore(endDate) ||
      current.isSame(endDate, "day")
    ) {
      dates.add(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }
  });

  return dates;
};
