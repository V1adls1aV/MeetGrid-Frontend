export const VOTING_RESOURCES = [
  { id: "stats50", title: "50%" },
  { id: "stats70", title: "70%" },
  { id: "stats90", title: "90%" },
  { id: "user", title: "Мой выбор" },
] as const;

export type VotingResource = (typeof VOTING_RESOURCES)[number];
export type VotingResourceId = VotingResource["id"];

export const USER_RESOURCE_ID: VotingResourceId = "user";
export const STATS_RESOURCE_IDS: VotingResourceId[] = [
  "stats50",
  "stats70",
  "stats90",
];

export const DAY_BOUNDARIES = {
  START_HOUR: 0,
  START_MINUTE: 0,
  END_HOUR: 23,
  END_MINUTE: 59,
  END_SECOND: 59,
} as const;

export const setDayStart = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(DAY_BOUNDARIES.START_HOUR, DAY_BOUNDARIES.START_MINUTE, 0, 0);
  return d;
};

export const setDayEnd = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(
    DAY_BOUNDARIES.END_HOUR,
    DAY_BOUNDARIES.END_MINUTE,
    DAY_BOUNDARIES.END_SECOND,
    999,
  );
  return d;
};
