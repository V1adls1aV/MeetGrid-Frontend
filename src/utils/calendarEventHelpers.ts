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
