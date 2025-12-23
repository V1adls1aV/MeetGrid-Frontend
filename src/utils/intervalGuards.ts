import { Modal } from "antd";
import { Interval } from "../types/topic";

type TimedEvent = { id?: string; start: Date; end: Date };

const toMs = (date: Date) => date.getTime();

/**
 * Returns true when candidate overlaps any existing event (touching edges is allowed).
 */
export const hasOverlap = (events: TimedEvent[], candidate: TimedEvent) =>
  events.some(
    (event) =>
      event.id !== candidate.id &&
      toMs(event.start) < toMs(candidate.end) &&
      toMs(event.end) > toMs(candidate.start),
  );

/**
 * Checks if the event end time is within the allowed daily limit (23:45).
 */
export const isWithinDayLimit = (candidate: TimedEvent) => {
  const end = candidate.end;
  const hours = end.getHours();
  const minutes = end.getMinutes();

  // Limit is 23:45. If same day, 23:45 is the max.
  // If it's 00:00 of the next day, it's definitely past 23:45.
  if (hours === 0 && end.getDate() !== candidate.start.getDate()) {
    return false;
  }

  if (hours > 23 || (hours === 23 && minutes > 45)) {
    return false;
  }
  return true;
};

/**
 * Checks if the event duration is at least 30 minutes.
 */
export const isLongEnough = (candidate: TimedEvent) => {
  const diffMs = toMs(candidate.end) - toMs(candidate.start);
  return diffMs >= 30 * 60 * 1000;
};

/**
 * Checks that candidate lies fully inside at least one allowed interval; empty list means no limits.
 */
export const fitsConstraints = (candidate: TimedEvent, allowed: Interval[]) => {
  if (!allowed.length) {
    return true;
  }

  const start = toMs(candidate.start);
  const end = toMs(candidate.end);
  return allowed.some(
    (interval) =>
      start >= new Date(interval.start).getTime() &&
      end <= new Date(interval.end).getTime(),
  );
};

export const showValidationWarning = (message: string) =>
  Modal.warning({
    title: "Предупреждение",
    content: message,
    okText: "Ок",
  });
