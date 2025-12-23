import { VotingResourceId } from "../constants/votingResources";

export interface VotingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: VotingResourceId;
  isEditable?: boolean;
}

export type { VotingResourceId };
