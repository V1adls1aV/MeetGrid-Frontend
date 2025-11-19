import { intervalsToSlots, slotsEqual, slotsToIntervals, VoteSlot } from './voteHelpers';

const sampleIntervals = [
  { start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' },
  { start: '2025-01-02T14:00:00.000Z', end: '2025-01-02T15:30:00.000Z' },
];

describe('voteHelpers', () => {
  it('converts backend intervals to slots with ids', () => {
    const slots = intervalsToSlots(sampleIntervals);
    expect(slots).toEqual([
      { id: `${sampleIntervals[0].start}-${sampleIntervals[0].end}`, ...sampleIntervals[0] },
      { id: `${sampleIntervals[1].start}-${sampleIntervals[1].end}`, ...sampleIntervals[1] },
    ]);
  });

  it('converts slots back to intervals for API payloads', () => {
    const slots: VoteSlot[] = [
      { id: 'slot-1', ...sampleIntervals[0] },
      { id: 'slot-2', ...sampleIntervals[1] },
    ];
    expect(slotsToIntervals(slots)).toEqual(sampleIntervals);
  });

  it('compares slots ignoring ids', () => {
    const left: VoteSlot[] = [
      { id: 'slot-1', ...sampleIntervals[0] },
      { id: 'slot-2', ...sampleIntervals[1] },
    ];
    const right: VoteSlot[] = [
      { id: 'slot-a', ...sampleIntervals[0] },
      { id: 'slot-b', ...sampleIntervals[1] },
    ];
    expect(slotsEqual(left, right)).toBe(true);
  });
});


