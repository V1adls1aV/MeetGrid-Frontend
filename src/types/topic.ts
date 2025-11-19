export interface Interval {
  start: string;
  end: string;
}

export interface Topic {
  topic_id: string;
  topic_name: string;
  admin_name: string;
  description: string | null;
  constraints: Interval[];
  votes: Record<string, Interval[]>;
  created_at: string;
}

export interface StatsInterval {
  start: string;
  end: string;
  people_min: number;
  people_max: number;
}

export interface TopicStats {
  blocks_90: StatsInterval[];
  blocks_70: StatsInterval[];
  blocks_50: StatsInterval[];
}

export interface TopicResponse {
  topic: Topic;
  stats: TopicStats;
}

export interface CreatedTopic {
  invite_link: string;
  topic: Topic;
}

export interface TopicCreatePayload {
  topic_name: string;
  description?: string | null;
  constraints: Interval[];
}

export interface VotePayload {
  intervals: Interval[];
}

export interface ConstraintsPayload {
  constraints: Interval[];
}

