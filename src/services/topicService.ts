import { getApiUrl } from "../config/apiConfig";
import {
  CreatedTopic,
  TopicResponse,
  TopicCreatePayload,
  VotePayload,
  ConstraintsPayload,
} from "../types/topic";

const appendQuery = (
  path: string,
  params?: Record<string, string | undefined>,
) => {
  if (!params) {
    return path;
  }

  const entries = Object.entries(params).filter(([, value]) => value);
  if (!entries.length) {
    return path;
  }

  const payload = entries.reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[key] = value as string;
      return acc;
    },
    {},
  );
  const joined = new URLSearchParams(payload).toString();
  return `${path}?${joined}`;
};

const requestJson = async <T>(path: string, options: RequestInit = {}) => {
  const response = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }

  return response.json() as Promise<T>;
};

export const createTopic = async (
  payload: TopicCreatePayload,
  username: string,
): Promise<CreatedTopic> =>
  requestJson<CreatedTopic>(appendQuery("/", { username }), {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchTopic = async (
  topicId: string,
  username?: string,
): Promise<TopicResponse> =>
  requestJson<TopicResponse>(appendQuery(`/${topicId}`, { username }));

export const saveVote = async (
  topicId: string,
  username: string,
  payload: VotePayload,
): Promise<TopicResponse> =>
  requestJson<TopicResponse>(appendQuery(`/${topicId}/pick`, { username }), {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const updateConstraints = async (
  topicId: string,
  username: string,
  payload: ConstraintsPayload,
): Promise<TopicResponse> =>
  requestJson<TopicResponse>(
    appendQuery(`/${topicId}/constraints`, { username }),
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
