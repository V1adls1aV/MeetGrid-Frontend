import { Interval } from '../types/topic';

// Internal type for calculations
interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Merges overlapping or adjacent intervals.
 * Assumes intervals are on the same day for simplicity,
 * or just treats them as continuous timestamps.
 */
function mergeIntervals(intervals: TimeRange[]): TimeRange[] {
  if (!intervals.length) return [];

  // Sort by start time
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());

  const merged: TimeRange[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start.getTime() <= last.end.getTime()) {
      // Overlap or adjacent: extend the last interval if needed
      if (current.end.getTime() > last.end.getTime()) {
        last.end = current.end;
      }
    } else {
      // No overlap
      merged.push(current);
    }
  }

  return merged;
}

/**
 * Calculates the "inverse" of the constraints for a specific day.
 * Returns the time ranges that should be blocked (grayed out).
 *
 * Logic:
 * 1. Define DayStart (00:00) and DayEnd (23:59:59).
 * 2. If no constraints are provided, the whole day is available -> return empty blocked list.
 *    (Based on existing fitsConstraints logic where empty = all allowed).
 * 3. If constraints exist, filter them to the current day and merge them.
 * 4. Calculate gaps:
 *    - StartOfDay -> First Constraint Start
 *    - Constraint[i].End -> Constraint[i+1].Start
 *    - Last Constraint End -> EndOfDay
 */
export const getBlockedIntervals = (date: Date, constraints: Interval[]): TimeRange[] => {
  if (!constraints || constraints.length === 0) {
    return [];
  }

  // Define day boundaries
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // 1. Convert constraint strings to Date objects and filter/trim to current day
  const relevantConstraints: TimeRange[] = [];

  for (const c of constraints) {
    const cStart = new Date(c.start);
    const cEnd = new Date(c.end);

    // Skip if completely outside the day
    if (cEnd.getTime() <= dayStart.getTime() || cStart.getTime() >= dayEnd.getTime()) {
      continue;
    }

    // Clamp to day boundaries
    const effectiveStart = cStart < dayStart ? dayStart : cStart;
    const effectiveEnd = cEnd > dayEnd ? dayEnd : cEnd;

    relevantConstraints.push({ start: effectiveStart, end: effectiveEnd });
  }

  if (relevantConstraints.length === 0) {
    // Constraints exist but none on this day -> entire day is blocked?
    // If the system implies "constraints define specific slots", then having constraints globally
    // but none on this day usually means this day is not available.
    // However, fitsConstraints simply checks if "allowed" is empty.
    // If "constraints" prop in VotingCalendar is passed, it is the GLOBAL list.
    // If that list is not empty, but nothing fits today, then today is fully blocked.
    return [{ start: dayStart, end: dayEnd }];
  }

  // 2. Merge overlapping constraints
  const merged = mergeIntervals(relevantConstraints);

  // 3. Find gaps (Blocked Intervals)
  const blocked: TimeRange[] = [];

  // Gap before first interval
  if (merged[0].start.getTime() > dayStart.getTime()) {
    blocked.push({ start: dayStart, end: merged[0].start });
  }

  // Gaps between intervals
  for (let i = 0; i < merged.length - 1; i++) {
    const currentEnd = merged[i].end;
    const nextStart = merged[i + 1].start;
    if (currentEnd.getTime() < nextStart.getTime()) {
      blocked.push({ start: currentEnd, end: nextStart });
    }
  }

  // Gap after last interval
  const lastEnd = merged[merged.length - 1].end;
  if (lastEnd.getTime() < dayEnd.getTime()) {
    blocked.push({ start: lastEnd, end: dayEnd });
  }

  return blocked;
};

export interface BackgroundEvent {
  id: string;
  start: Date;
  end: Date;
  isBackground: boolean;
  resourceId: string; // Required to match CalendarRenderEvent
  title: string;
}

/**
 * Generates the actual event objects for React-Big-Calendar.
 * Since we want the background to span specific resources (or all), we must create duplicates
 * for each resourceId if the generic 'undefined' resourceId doesn't work for specific views.
 *
 * In 'day' view with resources, RBC usually expects background events to have a resourceId
 * if we want them in that column, OR they might span if resourceId is missing (depends on version).
 * Safe bet: replicate for each resource column.
 */
export const generateBackgroundEvents = (
  blockedIntervals: TimeRange[],
  resourceIds: string[]
): BackgroundEvent[] => {
  const events: BackgroundEvent[] = [];

  blockedIntervals.forEach((interval, i) => {
    resourceIds.forEach((rId, rIndex) => {
      events.push({
        id: `bg-blocked-${i}-${rId}-${rIndex}`,
        start: interval.start,
        end: interval.end,
        isBackground: true,
        resourceId: rId,
        title: '',
      });
    });
  });

  return events;
};