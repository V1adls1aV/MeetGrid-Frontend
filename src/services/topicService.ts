// Purpose: обёртки над HTTP-запросами к /api/v1/topic.
import axios from 'axios';

const client = axios.create({ baseURL: '/api/v1/topic' });

export const fetchTopic = (topicId: string, username?: string) =>
  client.get(`/${topicId}`, { params: username ? { username } : undefined });

export const createTopic = (payload: Record<string, unknown>) => client.post('/', payload);

export const saveVote = (topicId: string, username: string, intervals: unknown[]) =>
  client.put(`/${topicId}/pick`, { intervals }, { params: { username } });

export const updateConstraints = (topicId: string, username: string, constraints: unknown[]) =>
  client.put(`/${topicId}/constraints`, { constraints }, { params: { username } });
