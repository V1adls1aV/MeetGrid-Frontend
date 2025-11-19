jest.mock('../services/topicService', () => ({
  createTopic: jest.fn(),
  fetchTopic: jest.fn(),
  saveVote: jest.fn(),
  updateConstraints: jest.fn(),
}));

import topicReducer, { TopicState, createTopicThunk, resetDraftForm, setDraftForm } from './topicSlice';

const emptyForm = { topicName: '', adminName: '', description: '' };
const baseState = (): TopicState => topicReducer(undefined, { type: '@@INIT' });

describe('topicSlice form draft', () => {
  it('merges draft form updates without dropping untouched fields', () => {
    const stateWithTopic = topicReducer(baseState(), setDraftForm({ topicName: 'Retro' }));
    const stateWithAdmin = topicReducer(stateWithTopic, setDraftForm({ adminName: 'Влад' }));

    expect(stateWithAdmin.draftForm).toEqual({ ...emptyForm, topicName: 'Retro', adminName: 'Влад' });
  });

  it('resets draft form back to defaults', () => {
    const filledState = topicReducer(
      baseState(),
      setDraftForm({ topicName: 'Demo', adminName: 'Lead', description: 'Discuss roadmap' })
    );
    const resetState = topicReducer(filledState, resetDraftForm());

    expect(resetState.draftForm).toEqual(emptyForm);
  });

  it('clears draft data after successful topic creation', () => {
    const dirtyState: TopicState = {
      ...baseState(),
      loading: true,
      draftForm: { topicName: 'Demo', adminName: 'Lead', description: 'Sync' },
      draftConstraints: [{ start: '2025-01-01T10:00:00.000Z', end: '2025-01-01T11:00:00.000Z' }],
    };

    const payload = {
      invite_link: 'https://meet.grid/topic/demo',
      topic: {
        topic_id: 'topic-demo',
        topic_name: 'Demo',
        admin_name: 'Lead',
        description: null,
        constraints: [],
        votes: {},
        created_at: '2025-01-01T09:00:00.000Z',
      },
    };

    const fulfilledAction = createTopicThunk.fulfilled(payload, 'request-id', {
      username: 'Lead',
      payload: { topic_name: 'Demo', description: null, constraints: [] },
    });
    const nextState = topicReducer(dirtyState, fulfilledAction);

    expect(nextState.draftForm).toEqual(emptyForm);
    expect(nextState.draftConstraints).toEqual([]);
    expect(nextState.inviteLink).toBe(payload.invite_link);
    expect(nextState.loading).toBe(false);
  });
});

