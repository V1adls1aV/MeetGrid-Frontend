import { Interval } from "../types/topic";

export interface VoteSlot {
  id: string;
  start: string;
  end: string;
}

export const intervalsToSlots = (intervals: Interval[]): VoteSlot[] =>
  intervals.map((interval) => ({
    id: `${interval.start}-${interval.end}`,
    start: interval.start,
    end: interval.end,
  }));

export const slotsToIntervals = (slots: VoteSlot[]): Interval[] =>
  slots.map((slot) => ({
    start: slot.start,
    end: slot.end,
  }));

export const slotsEqual = (first: VoteSlot[], second: VoteSlot[]) =>
  first.length === second.length &&
  first.every(
    (slot, index) =>
      slot.start === second[index].start && slot.end === second[index].end,
  );
