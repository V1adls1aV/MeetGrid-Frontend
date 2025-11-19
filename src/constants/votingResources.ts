export const VOTING_RESOURCES = [
  { id: 'stats50', title: '50%' },
  { id: 'stats70', title: '70%' },
  { id: 'stats90', title: '90%' },
  { id: 'user', title: 'Мой выбор' },
] as const;

export type VotingResource = (typeof VOTING_RESOURCES)[number];
export type VotingResourceId = VotingResource['id'];

export const USER_RESOURCE_ID: VotingResourceId = 'user';
export const STATS_RESOURCE_IDS: VotingResourceId[] = ['stats50', 'stats70', 'stats90'];


