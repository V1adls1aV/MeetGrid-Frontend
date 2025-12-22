import { Modal } from 'antd';
import { Interval } from '../types/topic';

type TimedEvent = { id?: string; start: Date; end: Date };

const toMs = (date: Date) => date.getTime();

/**
 * Returns true when candidate overlaps any existing event (touching edges is allowed).
 */
export const hasOverlap = (events: TimedEvent[], candidate: TimedEvent) =>
  events.some(
    (event) => event.id !== candidate.id && toMs(event.start) < toMs(candidate.end) && toMs(event.end) > toMs(candidate.start)
  );

/**
 * Checks that candidate lies fully inside at least one allowed interval; empty list means no limits.
 */
export const fitsConstraints = (candidate: TimedEvent, allowed: Interval[]) => {
  if (!allowed.length) {
    return true;
  }

  const start = toMs(candidate.start);
  const end = toMs(candidate.end);
  return allowed.some((interval) => start >= new Date(interval.start).getTime() && end <= new Date(interval.end).getTime());
};

export const showValidationWarning = (message: string) =>
  Modal.warning({
    title: 'Предупреждение',
    content: message,
    okText: 'Ок',
  });